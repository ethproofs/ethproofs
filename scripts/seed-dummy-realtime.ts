import { config } from "dotenv"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { inArray } from "drizzle-orm"
import * as schema from "../db/schema"
import { randomUUID } from "crypto"

config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 3,
})

const db = drizzle({
  client,
  schema,
  casing: "snake_case",
})

// Clusters from the image - all 8 zkVMs with deployment type and GPU count
const clusterData = [
  { 
    nickname: "Airbender 8x5090", 
    description: "High-performance proving cluster",
    deployment_type: "on-premise" as const,
    gpu_count: 8
  },
  { 
    nickname: "ZKsync Airbender 2 GPU", 
    description: "ZKsync optimized cluster",
    deployment_type: "on-premise" as const,
    gpu_count: 2
  },
  { 
    nickname: "Pico Prism", 
    description: "Pico zkVM cluster",
    deployment_type: "cloud" as const,
    gpu_count: 4
  },
  { 
    nickname: "ZkCloud Eth Prover v3", 
    description: "Ethereum prover cluster",
    deployment_type: "cloud" as const,
    gpu_count: 6
  },
  { 
    nickname: "OpenVM-Multi-GPU", 
    description: "Multi-GPU OpenVM cluster",
    deployment_type: "on-premise" as const,
    gpu_count: 8
  },
  { 
    nickname: "SP1 Hypercube Cluster", 
    description: "SP1 zkVM cluster",
    deployment_type: "cloud" as const,
    gpu_count: 4
  },
  { 
    nickname: "Zisk Sevilla Cloud Cluster", 
    description: "Cloud-based Zisk cluster",
    deployment_type: "cloud" as const,
    gpu_count: 6
  },
  { 
    nickname: "Zisk Girona On-Prem Cluster", 
    description: "On-premise Zisk cluster",
    deployment_type: "on-premise" as const,
    gpu_count: 8
  },
]

// Only states allowed in DB: queued, proving, proved
const statusFlow = [
  "queued",
  "proving",
  "proved",
] as const

async function seedDummyData() {
  console.log("🌱 Seeding dummy data for realtime visualization...")
  console.log("⚠️  Note: Make sure migration 0034 has been applied (deployment_type and gpu_count fields)")
  console.log("")

  try {
    // Create teams for each cluster group
    // Map cluster nicknames to team names
    const clusterToTeamMap: Record<string, string> = {
      "Airbender 8x5090": "Airbender",
      "ZKsync Airbender 2 GPU": "ZKsync",
      "Pico Prism": "Pico",
      "ZkCloud Eth Prover v3": "ZkCloud",
      "OpenVM-Multi-GPU": "OpenVM",
      "SP1 Hypercube Cluster": "SP1",
      "Zisk Sevilla Cloud Cluster": "Zisk",
      "Zisk Girona On-Prem Cluster": "Zisk",
    }
    
    // Get unique team names
    const uniqueTeamNames = Array.from(new Set(Object.values(clusterToTeamMap)))
    
    // Create or get teams
    const teamsMap = new Map<string, any>()
    
    for (const teamName of uniqueTeamNames) {
      // Try to find existing team by name
      let team = await db.query.teams.findFirst({
        where: (teams, { eq }) => eq(teams.name, teamName),
      })
      
      if (!team) {
        // Create team using SQL direct (since we need to handle auth.users reference)
        // Generate a unique UUID for each team
        const teamId = randomUUID()
        const slug = teamName.toLowerCase().replace(/\s+/g, "-")
        // Use simple email format: teamname@teamname.com
        const email = `${slug}@${slug}.com`
        
        // Teams require an auth user with a unique ID, so we need to create a new user for each team
        // First, check if a team with this slug already exists (might have been created before)
        let existingTeamBySlug = await db.query.teams.findFirst({
          where: (teams, { eq }) => eq(teams.slug, slug),
        })
        
        if (existingTeamBySlug) {
          team = existingTeamBySlug
          console.log(`ℹ️  Found existing team by slug: ${teamName}`)
        } else {
          // Create a new auth user for this team (each team needs its own auth user)
          // First, check if auth user with this email already exists
          let authUserId: string | null = null
          try {
            const existingUser = await client`
              SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
            `
            if (existingUser && existingUser.length > 0) {
              authUserId = existingUser[0].id
              console.log(`ℹ️  Found existing auth user for team: ${teamName}`)
            }
          } catch (err) {
            // Ignore, will try to create new user
          }
          
          // If no existing user, create one
          if (!authUserId) {
            try {
              const insertResult = await client`
                INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
                VALUES (
                  ${teamId}::uuid, 
                  ${email}, 
                  crypt('dummy', gen_salt('bf')), 
                  now(), 
                  ${JSON.stringify({ name: teamName })}::jsonb, 
                  'authenticated', 
                  'authenticated', 
                  now(), 
                  now()
                )
                ON CONFLICT (id) DO NOTHING
                RETURNING id
              `
              if (insertResult && insertResult.length > 0) {
                authUserId = insertResult[0].id
                console.log(`✅ Created auth user for team: ${teamName}`)
              } else {
                // If ON CONFLICT didn't return (user already exists), fetch it by email
                const existingUser = await client`
                  SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
                `
                if (existingUser && existingUser.length > 0) {
                  authUserId = existingUser[0].id
                  console.log(`ℹ️  Using existing auth user for team: ${teamName}`)
                }
              }
            } catch (error: any) {
              // If insert fails (e.g., email conflict), fetch existing user
              if (error.message?.includes("email") || error.message?.includes("duplicate key") || error.message?.includes("unique constraint")) {
                try {
                  const existingUser = await client`
                    SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
                  `
                  if (existingUser && existingUser.length > 0) {
                    authUserId = existingUser[0].id
                    console.log(`ℹ️  Found existing auth user after conflict for team: ${teamName}`)
                  }
                } catch (err) {
                  console.warn(`⚠️  Could not find existing auth user for ${teamName}`)
                }
              } else {
                console.warn(`⚠️  Could not create auth user for ${teamName}: ${error.message}`)
              }
            }
          }
          
          // Now create the team with the auth user's ID
          if (authUserId) {
            // First check if team already exists with this ID or slug
            let existingTeamById = await db.query.teams.findFirst({
              where: (teams, { eq }) => eq(teams.id, authUserId as string),
            })
            let existingTeamBySlug = await db.query.teams.findFirst({
              where: (teams, { eq }) => eq(teams.slug, slug),
            })
            
            if (existingTeamById) {
              team = existingTeamById
              console.log(`ℹ️  Team already exists with this ID: ${teamName}`)
            } else if (existingTeamBySlug) {
              team = existingTeamBySlug
              console.log(`ℹ️  Team already exists by slug: ${teamName}`)
            } else {
              // Team doesn't exist, create it
              try {
                const result = await client`
                  INSERT INTO teams (id, name, slug)
                  VALUES (${authUserId}::uuid, ${teamName}, ${slug})
                  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
                  RETURNING *
                `
                if (result && result.length > 0) {
                  // Use the same type that findFirst returns
                  const insertedTeam = await db.query.teams.findFirst({
                    where: (teams, { eq }) => eq(teams.id, authUserId as string),
                  })
                  if (insertedTeam) {
                    team = insertedTeam
                  }
                }
                
                if (team) {
                  console.log(`✅ Created team: ${teamName}`)
                } else {
                  // If team wasn't created, try to find it
                  team = await db.query.teams.findFirst({
                    where: (teams, { eq }) => eq(teams.slug, slug),
                  })
                  if (team) {
                    console.log(`ℹ️  Found existing team by slug after insert: ${teamName}`)
                  }
                }
              } catch (error: any) {
                // If team creation fails, check if it already exists
                if (error.message?.includes("duplicate key") || error.message?.includes("unique constraint")) {
                  team = await db.query.teams.findFirst({
                    where: (teams, { eq }) => eq(teams.slug, slug),
                  })
                  if (!team && authUserId) {
                    team = await db.query.teams.findFirst({
                      where: (teams, { eq }) => eq(teams.id, authUserId as string),
                    })
                  }
                  if (team) {
                    console.log(`ℹ️  Team already exists: ${teamName}`)
                  }
                } else {
                  console.warn(`⚠️  Could not create team ${teamName}: ${error.message}`)
                }
              }
            }
          }
        }
      } else {
        console.log(`ℹ️  Using existing team: ${teamName}`)
      }
      
      if (team) {
        teamsMap.set(teamName, team)
      }
    }
    
    // If no teams were created, try to get any existing team
    if (teamsMap.size === 0) {
      const existingTeam = await db.query.teams.findFirst()
      if (existingTeam) {
        teamsMap.set("Default", existingTeam)
        console.log(`⚠️  Using existing team: ${existingTeam.name}`)
      } else {
        console.log("❌ No teams available. Cannot create clusters without teams.")
        return
      }
    }

    // Check if new columns exist
    let hasNewColumns = false
    try {
      const result = await client`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'clusters' 
        AND column_name IN ('deployment_type', 'gpu_count')
      `
      hasNewColumns = Array.isArray(result) && result.length === 2
      if (hasNewColumns) {
        console.log("✅ New columns (deployment_type, gpu_count) found - will include them in cluster data")
      }
    } catch (err) {
      console.log("⚠️  Could not check for new columns, assuming they don't exist")
      hasNewColumns = false
    }

    if (!hasNewColumns) {
      console.log("⚠️  Warning: deployment_type and gpu_count columns not found.")
      console.log("   The script will continue without these fields.")
      console.log("   To enable them, run migration 0034_add-cluster-deployment-and-gpu-fields.sql")
      console.log("")
    }

    // Clean up existing proofs for the blocks we'll create to avoid conflicts
    const latestBlockNumber = 23_857_805
    const blockNumbersToClean = []
    for (let i = 0; i < 3; i++) {
      blockNumbersToClean.push(latestBlockNumber - i)
    }
    
    console.log("🧹 Cleaning up existing proofs for target blocks...")
    await db
      .delete(schema.proofs)
      .where(inArray(schema.proofs.block_number, blockNumbersToClean))
    console.log("✅ Cleaned up existing proofs")

    // Get or create zkvms for each team
    const zkvmsMap = new Map<string, any>()
    
    for (const [teamName, team] of teamsMap.entries()) {
      let zkvm = await db.query.zkvms.findFirst({
        where: (zkvms, { eq }) => eq(zkvms.team_id, team.id),
      })
      
      if (!zkvm) {
        const zkvmName = `${teamName.toLowerCase()}-zkvm`
        const [newZkvm] = await db
          .insert(schema.zkvms)
          .values({
            name: zkvmName,
            slug: zkvmName,
            isa: "RISC-V",
            repo_url: `https://github.com/${teamName.toLowerCase()}/zkvm`,
            continuations: false,
            dual_licenses: false,
            is_open_source: true,
            is_proving_mainnet: true,
            parallelizable_proving: true,
            precompiles: true,
            frontend: "Rust",
            team_id: team.id,
          })
          .returning()
        zkvm = newZkvm
        console.log(`✅ Created zkvm for team: ${teamName}`)
      }
      
      if (zkvm) {
        zkvmsMap.set(teamName, zkvm)
      }
    }
    
    // Fallback: if no zkvms were created, create one with the first team
    if (zkvmsMap.size === 0) {
      const firstTeam = Array.from(teamsMap.values())[0]
      if (firstTeam) {
        const [newZkvm] = await db
          .insert(schema.zkvms)
          .values({
            name: "dummy-zkvm",
            slug: "dummy-zkvm",
            isa: "RISC-V",
            repo_url: "https://github.com/dummy/zkvm",
            continuations: false,
            dual_licenses: false,
            is_open_source: true,
            is_proving_mainnet: true,
            parallelizable_proving: true,
            precompiles: true,
            frontend: "Rust",
            team_id: firstTeam.id,
          })
          .returning()
        if (newZkvm) {
          zkvmsMap.set("Default", newZkvm)
        }
      }
    }

    // Get or create zkvm versions for each zkvm
    const zkvmVersionsMap = new Map<string, any>()
    
    for (const [teamName, zkvm] of zkvmsMap.entries()) {
      let zkvmVersion = await db.query.zkvmVersions.findFirst({
        where: (zkvmVersions, { eq }) => eq(zkvmVersions.zkvm_id, zkvm.id),
      })

      if (!zkvmVersion) {
        const [newZkvmVersion] = await db
          .insert(schema.zkvmVersions)
          .values({
            zkvm_id: zkvm.id,
            version: "1.0.0",
            release_date: new Date().toISOString(),
          })
          .returning()
        zkvmVersion = newZkvmVersion
        console.log(`✅ Created zkvm version for team: ${teamName}`)
      }
      
      if (zkvmVersion) {
        zkvmVersionsMap.set(teamName, zkvmVersion)
      }
    }

    // Create clusters - assign each cluster to its corresponding team
    const clusters = []
    for (const clusterInfo of clusterData) {
      // Get the team for this cluster
      const teamName = clusterToTeamMap[clusterInfo.nickname] || "Default"
      const team = teamsMap.get(teamName) || Array.from(teamsMap.values())[0]
      
      if (!team) {
        console.log(`⚠️  No team available for cluster: ${clusterInfo.nickname}`)
        continue
      }
      
      // Use SQL directly if columns don't exist, otherwise use Drizzle
      let cluster
      if (!hasNewColumns) {
        // Use SQL directly to avoid schema mismatch
        const result = await client`
          INSERT INTO clusters (
            team_id, nickname, description, cycle_type, proof_type,
            is_multi_machine, is_open_source, is_active
          )
          VALUES (
            ${team.id}::uuid,
            ${clusterInfo.nickname},
            ${clusterInfo.description},
            'DUMMY',
            'STARK',
            ${Math.random() > 0.5},
            true,
            true
          )
          ON CONFLICT DO NOTHING
          RETURNING *
        `
        cluster = result[0] || null
      } else {
        // Use Drizzle when columns exist
        const clusterValues: any = {
          team_id: team.id,
          nickname: clusterInfo.nickname,
          description: clusterInfo.description,
          cycle_type: "DUMMY",
          proof_type: "STARK",
          is_multi_machine: Math.random() > 0.5,
          is_open_source: true,
          is_active: true,
          deployment_type: clusterInfo.deployment_type,
          gpu_count: clusterInfo.gpu_count,
        }

        const [insertedCluster] = await db
          .insert(schema.clusters)
          .values(clusterValues)
          .onConflictDoNothing()
          .returning()
        cluster = insertedCluster
      }

      if (cluster) {
        clusters.push(cluster)
        console.log(`✅ Created cluster: ${clusterInfo.nickname} (team: ${teamName})`)
      } else {
        // Get existing cluster (whether from SQL or Drizzle)
        const existing = await db.query.clusters.findFirst({
          where: (clusters, { eq }) => eq(clusters.nickname, clusterInfo.nickname),
        })
        if (existing) {
          clusters.push(existing)
          console.log(`ℹ️  Using existing cluster: ${clusterInfo.nickname}`)
        } else {
          console.log(`⚠️  Could not create or find cluster: ${clusterInfo.nickname}`)
        }
      }
    }

    // Create cluster versions for each cluster
    // Each cluster needs its own cluster_version to allow multiple proofs per block
    const clusterVersions = []
    console.log(`\n📦 Creating cluster versions for ${clusters.length} clusters...`)
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i]
      
      // Get the team for this cluster
      const clusterInfo = clusterData.find(c => c.nickname === cluster.nickname)
      const teamName = clusterInfo ? (clusterToTeamMap[clusterInfo.nickname] || "Default") : "Default"
      const zkvmVersion = zkvmVersionsMap.get(teamName) || Array.from(zkvmVersionsMap.values())[0]
      
      if (!zkvmVersion) {
        console.error(`❌ No zkvm version available for cluster: ${cluster.nickname}`)
        continue
      }
      
      // Create a unique version for each cluster to ensure we can have multiple proofs per block
      // Use a timestamp-based version to ensure uniqueness
      const uniqueVersion = `1.0.${i}-${Date.now()}`
      
      let clusterVersion = await db.query.clusterVersions.findFirst({
        where: (clusterVersions, { eq }) =>
          eq(clusterVersions.cluster_id, cluster.id),
      })
      
      if (!clusterVersion) {
        const [newVersion] = await db
          .insert(schema.clusterVersions)
          .values({
            cluster_id: cluster.id,
            zkvm_version_id: zkvmVersion.id,
            version: uniqueVersion,
            description: `Initial version for ${cluster.nickname}`,
          })
          .returning()
        clusterVersion = newVersion
        console.log(`✅ Created cluster version for: ${cluster.nickname} (version: ${uniqueVersion}, team: ${teamName})`)
      } else {
        console.log(`ℹ️  Using existing cluster version for: ${cluster.nickname} (version: ${clusterVersion.version})`)
      }
      
      if (clusterVersion) {
        clusterVersions.push({ cluster, clusterVersion })
      } else {
        console.error(`❌ Failed to get/create cluster version for: ${cluster.nickname}`)
      }
    }
    
    console.log(`\n✅ Total cluster versions ready: ${clusterVersions.length}`)

    // Create recent blocks
    // latestBlockNumber is already declared above
    const blocks = []
    for (let i = 0; i < 3; i++) {
      const blockNumber = latestBlockNumber - i
      const [block] = await db
        .insert(schema.blocks)
        .values({
          block_number: blockNumber,
          hash: `0x${Math.random().toString(16).slice(2, 66)}`,
          timestamp: new Date(Date.now() - i * 12000).toISOString(),
          gas_used: Math.floor(Math.random() * 30_000_000),
          transaction_count: Math.floor(Math.random() * 300),
        })
        .onConflictDoUpdate({
          target: [schema.blocks.block_number],
          set: {
            timestamp: new Date(Date.now() - i * 12000).toISOString(),
          },
        })
        .returning()
      blocks.push(block)
      console.log(`✅ Created/updated block: ${blockNumber}`)
    }

    // Create proofs with different statuses
    // Create proofs for ALL clusters in each block
    const proofs = []
    console.log(`\n🔨 Creating proofs for ${blocks.length} blocks and ${clusterVersions.length} clusters...`)
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
      const block = blocks[blockIndex]
      console.log(`\n📦 Block ${block.block_number}:`)
      
      // Create proofs for ALL clusters in each block
      // This ensures all 8 zkVMs appear in the visualization
      for (let i = 0; i < clusterVersions.length; i++) {
        const { cluster, clusterVersion } = clusterVersions[i]
        const initialStatus = statusFlow[Math.floor(Math.random() * statusFlow.length)]

        try {
          const [proof] = await db
            .insert(schema.proofs)
            .values({
              block_number: block.block_number,
              cluster_version_id: clusterVersion.id,
              cluster_id: cluster.id,
              team_id: cluster.team_id, // Use team_id from cluster
              proof_status: initialStatus,
              proving_cycles: Math.floor(Math.random() * 1_000_000) + 100_000,
              proving_time: Math.floor(Math.random() * 10_000) + 1_000,
              size_bytes: Math.floor(Math.random() * 1_000_000) + 10_000,
              queued_timestamp: new Date(Date.now() - 60000).toISOString(),
              proving_timestamp:
                initialStatus !== "queued"
                  ? new Date(Date.now() - 30000).toISOString()
                  : null,
              proved_timestamp:
                initialStatus === "proved"
                  ? new Date(Date.now() - 10000).toISOString()
                  : null,
            })
            .onConflictDoUpdate({
              target: [
                schema.proofs.block_number,
                schema.proofs.cluster_version_id,
              ],
              set: {
                proof_status: initialStatus,
                updated_at: new Date().toISOString(),
              },
            })
            .returning()

          if (proof) {
            proofs.push(proof)
            console.log(
              `  ✅ ${cluster.nickname} - status: ${initialStatus} (proof_id: ${proof.proof_id})`
            )
          } else {
            console.log(
              `  ⚠️  ${cluster.nickname} - No proof returned (may have been updated due to conflict)`
            )
          }
        } catch (error) {
          console.error(
            `  ❌ Error creating proof for ${cluster.nickname}:`,
            error instanceof Error ? error.message : error
          )
        }
      }
    }

    console.log(`\n✨ Seeded ${clusters.length} clusters, ${blocks.length} blocks, and ${proofs.length} proofs`)
    console.log("🎯 Run 'pnpm dev:update-realtime' to start updating statuses in real-time")
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("deployment_type") || errorMessage.includes("gpu_count")) {
      console.error("❌ Error: The migration for deployment_type and gpu_count fields has not been applied yet.")
      console.error("   Please run the migration 0034_add-cluster-deployment-and-gpu-fields.sql first.")
      console.error("   You can apply it via Supabase Studio or using: supabase db push")
      console.error("")
      console.error("   Original error:", errorMessage)
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("❌ Error seeding data:", errorMessage)
    }
    throw error
  } finally {
    await client.end()
  }
}

seedDummyData()

