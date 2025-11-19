import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

import { withAuth } from "./with-auth"

// Initialize Redis client for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

/**
 * Create a rate limiter for a specific endpoint
 * @param identifier - Unique identifier (e.g., API key, IP address, user ID)
 * @param requests - Number of requests allowed in the window
 * @param window - Time window in seconds (e.g., 60 for per-minute)
 */
export async function checkRateLimit(
  identifier: string,
  requests: number = 10,
  window: number = 60
): Promise<{
  success: boolean
  remaining: number
  resetTime: number
  error?: string
}> {
  // Check whitelist first - bypass rate limiting for whitelisted API keys
  if (identifier.startsWith("apikey:")) {
    const apiKey = identifier.substring(7) // remove 'apikey:' prefix
    const whitelist = (process.env.RATE_LIMIT_WHITELIST || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)

    if (whitelist.includes(apiKey)) {
      return {
        success: true,
        remaining: -1, // unlimited
        resetTime: Infinity,
        error: undefined,
      }
    }
  }

  try {
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(requests, `${window}s`),
      analytics: true,
      prefix: "ethproofs",
    })

    const result = await ratelimit.limit(identifier)

    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: result.reset,
      error: !result.success
        ? `Rate limit exceeded. Try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds`
        : undefined,
    }
  } catch (error) {
    console.error("Rate limit check failed:", error)
    // Fail open - allow request if rate limit service is down
    return {
      success: true,
      remaining: -1,
      resetTime: Date.now(),
      error: undefined,
    }
  }
}

/**
 * Rate limit middleware for Next.js API routes
 * Extracts API key from Authorization header and rate limits based on that
 * Supports both static and dynamic routes
 */
export function withRateLimit<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  handler: (request: Request, params: T) => Promise<Response>,
  options: {
    requests?: number // Default: 10
    window?: number // Default: 60 seconds
    identifier?: (request: Request) => string // Custom identifier function
  } = {}
): (request: Request, params: T) => Promise<Response> {
  const { requests = 10, window = 60, identifier } = options

  return async (request: Request, params: T) => {
    // Extract identifier (API key or IP)
    const id = identifier
      ? identifier(request)
      : extractApiKey(request) || extractIp(request)

    const rateCheck = await checkRateLimit(id, requests, window)

    if (!rateCheck.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: rateCheck.error,
          retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(
              (rateCheck.resetTime - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Remaining": rateCheck.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateCheck.resetTime).toISOString(),
          },
        }
      )
    }

    // Add rate limit info to response headers
    const response = await handler(request, params)
    const headers = new Headers(response.headers)
    headers.set("X-RateLimit-Remaining", rateCheck.remaining.toString())
    headers.set(
      "X-RateLimit-Reset",
      new Date(rateCheck.resetTime).toISOString()
    )

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

/**
 * Compose rate limiting with the withAuth middleware
 * Use this for authenticated endpoints that need rate limiting
 * Supports both static and dynamic routes
 */
export function withAuthAndRateLimit<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  handler: (
    auth: {
      request: Request
      user: { id: string }
      apiKey?: { mode: string; team_id: string }
      timestamp: string
    },
    params: T
  ) => Promise<Response>,
  options: {
    requests?: number // Default: 10
    window?: number // Default: 60 seconds
  } = {}
): (request: Request, params: T) => Promise<Response> {
  const { requests = 10, window = 60 } = options

  // First apply auth, then rate limit based on API key
  const authHandler = withAuth(handler)

  return async (request: Request, params: T) => {
    // Extract API key for rate limiting
    const apiKey = extractApiKey(request)
    if (!apiKey) {
      // Let auth middleware handle missing API key
      return authHandler(request, params)
    }

    const rateCheck = await checkRateLimit(apiKey, requests, window)

    if (!rateCheck.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: rateCheck.error,
          retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(
              (rateCheck.resetTime - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Remaining": rateCheck.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateCheck.resetTime).toISOString(),
          },
        }
      )
    }

    // Pass to auth handler
    const response = await authHandler(request, params)
    const headers = new Headers(response.headers)
    headers.set("X-RateLimit-Remaining", rateCheck.remaining.toString())
    headers.set(
      "X-RateLimit-Reset",
      new Date(rateCheck.resetTime).toISOString()
    )

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

/**
 * Extract API key from Authorization header
 */
function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null

  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null

  return `apikey:${parts[1]}`
}

/**
 * Extract IP address from request headers
 */
function extractIp(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"

  return `ip:${ip}`
}
