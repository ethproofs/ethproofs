import { copycat, faker } from "@snaplet/copycat"
import { createSeedClient, teamsScalars } from "@snaplet/seed"

const proverProfiles: Partial<teamsScalars>[] = [
  {
    team_name: "Succinct",
    logo_url:
      "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/succinct-logo.svg",
    website_url: "https://succinct.xyz",
    twitter_handle: "succinctlabs",
    github_org: "Succinct",
  },
  {
    team_name: "RiscZero",
    logo_url:
      "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/risc-zero-logo.svg",
    website_url: "https://risczero.com",
    twitter_handle: "RiscZero",
    github_org: "risc0",
  },
]

const main = async () => {
  const seed = await createSeedClient({ dryRun: true })

  const { users } = await seed.users((x) =>
    x(2, ({ index }) => ({
      aud: "authenticated",
      role: "authenticated",
      email: `${proverProfiles[index].github_org}@test.com`,
      encrypted_password: "password",
    }))
  )

  const { blocks } = await seed.blocks((x) =>
    x(2000, () => ({
      hash: () => "0x" + faker.git.commitSha({ length: 64 }),
      timestamp: () => faker.date.recent().toISOString(),
    }))
  )

  const { aws_instance_pricing } = await seed.aws_instance_pricing((x) =>
    x(3, ({ index }) => ({
      instance_type: ["t3.medium", "t3.large", "t3.xlarge"][index],
      hourly_price: [0.0416, 0.0832, 0.1664][index],
    }))
  )

  for (const user of users) {
    const userIndex = users.indexOf(user)
    const profile = proverProfiles[userIndex]

    // add team for user
    await seed.teams(
      (x) =>
        x(1, () => ({
          team_id: userIndex + 1,
          ...profile,
        })),
      {
        connect: { users: [user] },
      }
    )

    // add 2 clusters per team/user
    const { clusters } = await seed.clusters(
      (x) =>
        x(2, ({ seed, index }) => {
          return {
            cluster_name: `Cluster ${copycat.firstName(index)}`,
            cluster_description: faker.lorem.sentence(),
            cluster_hardware: faker.lorem.sentence(),
            cluster_cycle_type:
              faker.lorem.word().slice(0, 2).toUpperCase() + index,
            cluster_proof_type: copycat.oneOfString(seed, ["STARK", "SNARK"]),
          }
        }),
      {
        connect: { users: [user] },
      }
    )

    await seed.cluster_configurations(
      (x) =>
        x(5, ({ seed }) => ({
          instance_count: copycat.int(seed, { min: 1, max: 10 }),
        })),
      { connect: { clusters, aws_instance_pricing } }
    )

    await seed.proofs(
      (x) =>
        x(500, () => ({
          proof_id: ({ seed }) => copycat.int(seed, { min: 1, max: 1000000 }),
          proof: Buffer.from("{}"),
          proving_time: ({ seed }) =>
            copycat.int(seed, { min: 1000, max: 10000 }),
          proof_status: ({ seed }) =>
            copycat.oneOfString(seed, ["proved", "proving", "queued"]),
          proving_cycles: ({ seed }) =>
            copycat.int(seed, { min: 100000, max: 1000000 }),
        })),
      { connect: { users, blocks, clusters } }
    )
  }

  process.exit()
}

main()
