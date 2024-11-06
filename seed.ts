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
      hash: () => "0x" + faker.git.commitSha(),
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

    // add 2 machines per team/user
    const { prover_machines } = await seed.prover_machines(
      (x) =>
        x(2, ({ index }) => {
          return {
            machine_id: userIndex * 2 + index + 1,
            machine_name: `Machine ${copycat.firstName(index)}`,
            ...profile,
          }
        }),
      {
        connect: { users: [user] },
      }
    )

    await seed.proofs(
      (x) =>
        x(1000, () => ({
          proof_id: ({ seed }) => copycat.int(seed, { min: 1, max: 1000000 }),
          proof: Buffer.from("{}"),
          prover_duration: ({ seed }) => copycat.dateString(seed).slice(11, 19),
          proof_status: ({ seed }) =>
            copycat.oneOfString(seed, ["proved", "proving", "queued"]),
        })),
      { connect: { users, blocks, prover_machines } }
    )
  }

  process.exit()
}

main()
