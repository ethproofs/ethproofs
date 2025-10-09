import { uploadCspBenchmarks } from "@/lib/api/csp-benchmarks"
import { withAuth } from "@/lib/middleware/with-auth"
import { validateFilename, ValidationError } from "@/utils/validation"

export const POST = withAuth(async ({ apiKey, request }) => {
  // Restrict to admin mode
  if (apiKey?.mode !== "admin") {
    return new Response(
      "Forbidden: admin mode required for uploading csp benchmarks",
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new Response("No file provided", { status: 400 })
    }

    if (file.type !== "application/json") {
      return new Response("File must be a JSON file", { status: 400 })
    }

    const filename = formData.get("filename") as string
    if (!filename) {
      return new Response("No filename provided", { status: 400 })
    }

    validateFilename(filename)
    const filenameWithExtension = filename.endsWith(".json")
      ? filename
      : `${filename}.json`
    const result = await uploadCspBenchmarks(filenameWithExtension, file)

    if (!result) {
      return new Response("Failed to upload file", { status: 500 })
    }

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
  } catch (error) {
    console.error("Error uploading csp-benchmarks:", error)

    if (error instanceof ValidationError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response("Internal server error", { status: 500 })
  }
})
