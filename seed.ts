import { createSeedClient } from "@snaplet/seed"
import { copycat } from "@snaplet/copycat"

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

  const { blocks } = await seed.blocks((x) => x(5000))

  const { prover_machines } = await seed.prover_machines(
    (x) =>
      x(10, {
        machine_id: ({ seed }) => copycat.int(seed, { min: 1, max: 10 }),
        machine_name: ({ seed }) => `Machine ${copycat.firstName(seed)}`,
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
