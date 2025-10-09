import { uploadVerificationKey } from "@/lib/api/verification-keys"
import { withAuth } from "@/lib/middleware/with-auth"
import { validateFilename, ValidationError } from "@/utils/validation"

export const POST = withAuth(async ({ request, apiKey }) => {
  // Temporarily restrict to admin mode
  if (apiKey?.mode !== "admin") {
    return new Response(
      "Forbidden: admin mode required for uploading verification keys",
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new Response("No file provided", { status: 400 })
    }

    const filename = formData.get("filename") as string
    if (!filename) {
      return new Response("No filename provided", { status: 400 })
    }

    validateFilename(filename)
    const filenameWithExtension = filename.endsWith(".bin")
      ? filename
      : `${filename}.bin`
    const result = await uploadVerificationKey(filenameWithExtension, file)

    if (!result) {
      return new Response("Failed to upload file", { status: 500 })
    }

    return new Response(
      JSON.stringify({
        message: "Verification key uploaded successfully",
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
    console.error("Error uploading verification key:", error)

    if (error instanceof ValidationError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response("Internal server error", { status: 500 })
  }
})
