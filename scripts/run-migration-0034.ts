import { config } from "dotenv"
import postgres from "postgres"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 3,
})

async function runMigration() {
  console.log("🔄 Running migration 0034: Add deployment_type and gpu_count to clusters table...")
  
  try {
    // Check if columns already exist
    const checkResult = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clusters' 
      AND column_name IN ('deployment_type', 'gpu_count')
    `
    
    if (checkResult.length === 2) {
      console.log("✅ Columns already exist. Migration already applied.")
      await client.end()
      return
    }
    
    if (checkResult.length === 1) {
      console.log("⚠️  One column already exists. Will add the missing one.")
    }
    
    // Run the migration - execute commands separately
    console.log("  Adding deployment_type column...")
    await client`
      ALTER TABLE "clusters"
      ADD COLUMN IF NOT EXISTS "deployment_type" varchar
    `
    
    console.log("  Adding gpu_count column...")
    await client`
      ALTER TABLE "clusters"
      ADD COLUMN IF NOT EXISTS "gpu_count" integer
    `
    
    console.log("  Adding comments...")
    await client`
      COMMENT ON COLUMN "clusters"."deployment_type" IS 'Deployment type: "cloud" or "on-premise"'
    `
    
    await client`
      COMMENT ON COLUMN "clusters"."gpu_count" IS 'Total number of GPUs in the cluster'
    `
    
    console.log("✅ Migration completed successfully!")
    console.log("📝 Next steps:")
    console.log("   1. Uncomment deployment_type and gpu_count in db/schema.ts (lines 121-122)")
    console.log("   2. Run: pnpm seed:realtime")
    console.log("   3. The filters should now work!")
    
  } catch (error) {
    console.error("❌ Error running migration:", error)
    throw error
  } finally {
    await client.end()
  }
}

runMigration()

