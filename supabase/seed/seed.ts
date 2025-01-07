import { copycat, faker } from "@snaplet/copycat"
import { createSeedClient, teamsScalars } from "@snaplet/seed"

const proverProfiles: Partial<teamsScalars>[] = [
  {
    name: "Succinct",
    logo_url:
      "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/succinct-logo.svg",
    website_url: "https://succinct.xyz",
    twitter_handle: "succinctlabs",
    github_org: "Succinct",
  },
  {
    name: "RiscZero",
    logo_url:
      "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/risc-zero-logo.svg",
    website_url: "https://risczero.com",
    twitter_handle: "RiscZero",
    github_org: "risc0",
  },
]

const getRandomHexString = (minBytes: number, maxBytes: number) => {
  const minLength = minBytes * 2 // Each byte is represented by 2 hex characters
  const maxLength = maxBytes * 2
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
  return Array(length)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")
}

const main = async () => {
  const seed = await createSeedClient({ dryRun: true })

  const { users } = await seed.users((x) =>
    x(2, ({ index }) => ({
      aud: "authenticated",
      role: "authenticated",
      email: `${proverProfiles[index].github_org}@test.com`,
      raw_user_meta_data: {
        first_name: copycat.firstName(index),
        last_name: copycat.lastName(index),
      },
      encrypted_password: "password",
    }))
  )

  await seed.api_auth_tokens((x) =>
    x(1, () => ({
      team_id: users[0].id,
      // token (w/ SECRET=secret): Y01Xu-5hwHpKkKtCo_uHEGTn
      token: "bee1968d88a7ee4560c3409146ad1812b44a778735b59953344abea41aafa206",
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
    // const { teams } = await seed.teams(
    //   (x) =>
    //     x(1, () => ({
    //       ...profile,
    //     })),
    //   {
    //     connect: { users: [user] },
    //   }
    // )

    // add 2 clusters per team/user
    const { clusters } = await seed.clusters(
      (x) =>
        x(2, ({ seed, index }) => {
          return {
            nickname: `Cluster ${copycat.firstName(index)}`,
            description: faker.lorem.sentence(),
            hardware: faker.lorem.sentence(),
            cycle_type: faker.lorem.word().slice(0, 2).toUpperCase() + index,
            proof_type: copycat.oneOfString(seed, ["STARK", "SNARK"]),
          }
        }),
      {
        connect: { teams: [{ id: user.id }] },
      }
    )

    await seed.cluster_configurations(
      (x) =>
        x(5, ({ seed }) => ({
          instance_count: copycat.int(seed, { min: 1, max: 10 }),
        })),
      { connect: { clusters, aws_instance_pricing } }
    )

    const { proofs } = await seed.proofs(
      (x) =>
        x(200, () => ({
          proof_id: ({ seed }) => copycat.int(seed, { min: 1, max: 1000000 }),
          proving_time: ({ seed }) =>
            copycat.int(seed, { min: 1000, max: 10000 }),
          proof_status: ({ seed }) =>
            copycat.oneOfString(seed, ["proved", "proving", "queued"]),
          proving_cycles: ({ seed }) =>
            copycat.int(seed, { min: 100000, max: 1000000 }),
          size_bytes: ({ seed }) =>
            copycat.int(seed, { min: 2 ** 15, max: 2 ** 23 }),
          team_id: user.id,
        })),
      { connect: { blocks, clusters } }
    )

    for (const { proof_id, proof_status } of proofs) {
      if (proof_status !== "proved") continue

      await seed.proof_binaries((x) =>
        x(1, () => ({
          proof_id,
          proof_binary: Buffer.from(getRandomHexString(500, 4200)),
        }))
      )
    }
  }

  process.exit()
}

main()
