/**
 * Migration script to copy all proof binary files from the old bucket
 * (proof_binaries) to the new bucket (proof-binaries)
 *
 * Usage:
 *   npx tsx scripts/migrate-proof-binaries-bucket.ts [--dry-run]
 *
 * Options:
 *   --dry-run    List files that would be copied without actually copying them
 *   --delete-old Delete files from old bucket after successful copy (use with caution!)
 */

import { createClient } from "@supabase/supabase-js"

const OLD_BUCKET = "proof_binaries"
const NEW_BUCKET = "proof-binaries"

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing required environment variables")
  console.error("Required:")
  console.error("  - NEXT_PUBLIC_SUPABASE_URL")
  console.error("  - SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const deleteOld = args.includes("--delete-old")

if (deleteOld && isDryRun) {
  console.error("Error: Cannot use --delete-old with --dry-run")
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function listAllFiles(bucket: string): Promise<string[]> {
  const allFiles: string[] = []
  let offset = 0
  const limit = 1000
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list("", { limit, offset })

    if (error) {
      throw new Error(`Failed to list files in ${bucket}: ${error.message}`)
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    allFiles.push(...data.map((file) => file.name))
    offset += data.length

    if (data.length < limit) {
      hasMore = false
    }
  }

  return allFiles
}

async function copyFile(filename: string): Promise<boolean> {
  try {
    // Download from old bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(OLD_BUCKET)
      .download(filename)

    if (downloadError) {
      console.error(
        `  ✗ Failed to download ${filename}: ${downloadError.message}`
      )
      return false
    }

    if (!fileData) {
      console.error(`  ✗ No data received for ${filename}`)
      return false
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Rename .txt files to .bin
    const newFilename = filename.endsWith(".txt")
      ? filename.replace(/\.txt$/, ".bin")
      : filename

    // Upload to new bucket with new filename
    const { error: uploadError } = await supabase.storage
      .from(NEW_BUCKET)
      .upload(newFilename, buffer, {
        contentType: "application/octet-stream",
        upsert: true,
      })

    if (uploadError) {
      console.error(
        `  ✗ Failed to upload ${newFilename}: ${uploadError.message}`
      )
      return false
    }

    return true
  } catch (error) {
    console.error(`  ✗ Error copying ${filename}:`, error)
    return false
  }
}

async function deleteFile(filename: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(OLD_BUCKET).remove([filename])

    if (error) {
      console.error(`  ✗ Failed to delete ${filename}: ${error.message}`)
      return false
    }

    return true
  } catch (error) {
    console.error(`  ✗ Error deleting ${filename}:`, error)
    return false
  }
}

async function migrate() {
  console.log("🚀 Proof Binaries Bucket Migration")
  console.log(`   From: ${OLD_BUCKET}`)
  console.log(`   To: ${NEW_BUCKET}`)
  if (isDryRun) {
    console.log("   Mode: DRY RUN (no changes will be made)")
  }
  if (deleteOld) {
    console.log("   ⚠️  Delete old files: ENABLED")
  }
  console.log()

  // Verify new bucket exists
  console.log("📋 Verifying buckets...")
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets()

  if (bucketsError) {
    console.error("✗ Failed to list buckets:", bucketsError.message)
    process.exit(1)
  }
  console.log("buckets found:", buckets)
  const oldBucketExists = buckets?.some((b) => b.name === OLD_BUCKET)
  const newBucketExists = buckets?.some((b) => b.name === NEW_BUCKET)

  if (!oldBucketExists) {
    console.error(`✗ Old bucket '${OLD_BUCKET}' not found`)
    process.exit(1)
  }

  if (!newBucketExists) {
    console.error(`✗ New bucket '${NEW_BUCKET}' not found`)
    console.error(
      "  Please create the new bucket first via Supabase dashboard or CLI"
    )
    process.exit(1)
  }

  console.log(`✓ Old bucket '${OLD_BUCKET}' exists`)
  console.log(`✓ New bucket '${NEW_BUCKET}' exists`)
  console.log()

  // List all files
  console.log("📂 Listing files in old bucket...")
  const files = await listAllFiles(OLD_BUCKET)
  console.log(`   Found ${files.length} files`)
  console.log()

  if (files.length === 0) {
    console.log("✓ No files to migrate")
    return
  }

  if (isDryRun) {
    console.log("📝 Files that would be copied:")
    files.forEach((file) => console.log(`   - ${file}`))
    console.log()
    console.log(`✓ Dry run complete. Would copy ${files.length} files.`)
    return
  }

  // Copy files
  console.log("📦 Copying files...")
  let successCount = 0
  let failCount = 0
  const failedFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const newFilename = file.endsWith(".txt")
      ? file.replace(/\.txt$/, ".bin")
      : file
    const renamed = file !== newFilename

    process.stdout.write(
      `   [${i + 1}/${files.length}] Copying ${file}${renamed ? ` → ${newFilename}` : ""}...`
    )

    const success = await copyFile(file)

    if (success) {
      successCount++
      console.log(" ✓")

      // Delete old file if requested
      if (deleteOld) {
        process.stdout.write(
          `   [${i + 1}/${files.length}] Deleting ${file} from old bucket...`
        )
        const deleted = await deleteFile(file)
        if (deleted) {
          console.log(" ✓")
        } else {
          console.log(" ✗ (copy succeeded but delete failed)")
        }
      }
    } else {
      failCount++
      failedFiles.push(file)
      console.log(" ✗")
    }
  }

  console.log()
  console.log("📊 Migration Summary:")
  console.log(`   Total files: ${files.length}`)
  console.log(`   Successful: ${successCount}`)
  console.log(`   Failed: ${failCount}`)

  if (failedFiles.length > 0) {
    console.log()
    console.log("❌ Failed files:")
    failedFiles.forEach((file) => console.log(`   - ${file}`))
  }

  console.log()
  if (failCount === 0) {
    console.log("✅ Migration completed successfully!")
    if (deleteOld) {
      console.log(`   Old bucket '${OLD_BUCKET}' has been cleaned up`)
    } else {
      console.log(`   Old bucket '${OLD_BUCKET}' still contains original files`)
      console.log(`   You can delete it manually after verifying the migration`)
    }
  } else {
    console.log("⚠️  Migration completed with errors")
    console.log("   Please review failed files and retry if needed")
    process.exit(1)
  }
}

// Run migration
migrate().catch((error) => {
  console.error("💥 Fatal error:", error)
  process.exit(1)
})
