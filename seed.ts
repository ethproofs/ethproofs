import { copycat, faker } from "@snaplet/copycat"
import { createSeedClient } from "@snaplet/seed"

const main = async () => {
  const seed = await createSeedClient({ dryRun: true })

  const { users } = await seed.users((x) =>
    x(2, ({ index }) => ({
      aud: "authenticated",
      role: "authenticated",
      email: `user-${index}@test.com`,
      encrypted_password: "password",
    }))
  )

  const { blocks } = await seed.blocks((x) =>
    x(5000, () => ({
      hash: () => "0x" + faker.git.commitSha(),
    }))
  )

  const proverProfiles = [
    {
      logo_url:
        "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/succinct-logo.svg",
      website_url: "https://succinct.xyz",
      twitter_handle: "succinctlabs",
      github_org: "Succinct",
    },
    {
      logo_url:
        "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/risc-zero-logo.svg",
      website_url: "https://risczero.com",
      twitter_handle: "RiscZero",
      github_org: "risc0",
    },
  ]

  const { prover_machines } = await seed.prover_machines(
    (x) =>
      x(10, ({ seed, index }) => {
        const profile = copycat.oneOf(seed, proverProfiles)
        return {
          machine_id: index + 1,
          machine_name: `Machine ${copycat.firstName(index)}`,
          ...profile,
        }
      }),
    {
      connect: { users },
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
    { connect: { users, prover_machines, blocks } }
  )

  process.exit()
}

main()
