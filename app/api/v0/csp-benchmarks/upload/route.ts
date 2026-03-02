import { revalidateTag } from "next/cache"

import { TAGS } from "@/lib/constants"

import {
  isValidCspBenchmarkData,
  uploadCspBenchmarks,
} from "@/lib/api/csp-benchmarks"
import { withAuth } from "@/lib/middleware/with-auth"
import { isValidFilename } from "@/utils/validation"

export const POST = withAuth(async ({ apiKey, request }) => {
  if (apiKey?.mode !== "admin") {
    return new Response(
      "Forbidden: admin mode required for uploading csp benchmarks",
      { status: 403 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return new Response("Invalid form data", { status: 400 })
  }

  const file = formData.get("file")

  if (!(file instanceof File)) {
    return new Response("No file provided", { status: 400 })
  }

  const filename = formData.get("filename")
  if (typeof filename !== "string" || !filename) {
    return new Response("No filename provided", { status: 400 })
  }

  if (!isValidFilename(filename)) {
    return new Response(
      "Invalid filename format. Only alphanumeric characters, underscores, and hyphens are allowed.",
      { status: 400 }
    )
  }

  const filenameWithExtension = `${filename}.json`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let rawData: unknown
  try {
    rawData = JSON.parse(buffer.toString("utf-8"))
  } catch {
    return new Response("File does not contain valid JSON", { status: 400 })
  }

  if (!isValidCspBenchmarkData(rawData)) {
    return new Response(
      "File does not match expected benchmark format (structured or flat)",
      { status: 400 }
    )
  }

  const result = await uploadCspBenchmarks(filenameWithExtension, buffer)

  if (!result) {
    return new Response("Failed to upload file", { status: 500 })
  }

  revalidateTag(TAGS.CSP_BENCHMARKS)

  return new Response(
    JSON.stringify({
      message: "CSP benchmarks uploaded successfully",
      path: result.path,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
})
