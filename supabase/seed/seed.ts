import { setSeconds } from "date-fns"
import { copycat, faker } from "@snaplet/copycat"
import { createSeedClient } from "@snaplet/seed"

const vendorsProfiles = [
  {
    name: "Succinct",
    logo_url:
      "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/succinct-logo.svg",
    website_url: "https://succinct.xyz",
    twitter_handle: "succinctlabs",
    github_org: "succinctlabs",
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

const proversProfiles = [
  {
    name: "Succinct",
    logo_url:
      "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/succinct-logo.svg",
    website_url: "https://succinct.xyz",
    twitter_handle: "succinctlabs",
    github_org: "succinctlabs",
  },
  {
    name: "Snarkify",
    logo_url:
      "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/snarkify-logo.svg",
    website_url: "https://snarkify.xyz",
    twitter_handle: "snarkify",
    github_org: "snarkify",
  },
  {
    name: "zkm",
    logo_url:
      "https://ibkqxhjnroghhtfyualc.supabase.co/storage/v1/object/public/public-assets/zkm-logo.svg",
    website_url: "https://zkm.xyz",
    twitter_handle: "zkm",
    github_org: "zkm",
  },
]

const zkvmsData = [
  {
    name: "cairo",
    isa: "Cairo",
    continuations: false,
    parallelizable_proving: false,
    precompiles: true,
    frontend: "Cairo",
    repo_url: "https://github.com/lambdaclass/cairo-vm",
  },
  {
    name: "ceno",
    isa: "RISC-V",
    continuations: false,
    parallelizable_proving: false,
    precompiles: true,
    frontend: "Rust",
    repo_url: "https://github.com/scroll-tech/ceno",
  },
  {
    name: "eigen zkvm",
    isa: "RISC-V",
    continuations: true,
    parallelizable_proving: true,
    precompiles: true,
    frontend: "Circom, PIL",
    repo_url: "https://github.com/0xEigenLabs/eigen-zkvm",
  },
  {
    name: "jolt",
    isa: "RISC-V",
    continuations: false,
    parallelizable_proving: false,
    precompiles: false,
    frontend: "Rust",
    repo_url: "https://github.com/a16z/jolt",
  },
  {
    name: "miden",
    isa: "MASM(Miden Assembly)",
    continuations: false,
    parallelizable_proving: false,
    precompiles: true,
    frontend: "Rust, Wasm",
    repo_url: "https://github.com/0xPolygonMiden/miden-vm",
  },
]

const main = async () => {
  const seed = await createSeedClient({ dryRun: true })

  // create users for each vendors & provers profile
  const { users } = await seed.users((x) =>
    x([...vendorsProfiles, ...proversProfiles].length, ({ index }) => {
      const profile =
        index < vendorsProfiles.length
          ? vendorsProfiles[index]
          : proversProfiles[index - vendorsProfiles.length]
      return {
        email: `${profile.name.toLowerCase()}@${
          index < vendorsProfiles.length ? "vendor" : "prover"
        }.com`,
        name: profile.name,
        aud: "authenticated",
        role: "authenticated",
        raw_user_meta_data: {
          first_name: copycat.firstName(index),
          last_name: copycat.lastName(index),
        },
        encrypted_password: "password",
      }
    })
  )

  // add vendors
  const { vendors } = await seed.vendors(
    (x) =>
      x(vendorsProfiles.length, ({ index }) => ({
        name: vendorsProfiles[index].name,
        logo_url: vendorsProfiles[index].logo_url,
        website_url: vendorsProfiles[index].website_url,
        twitter_handle: vendorsProfiles[index].twitter_handle,
        github_org: vendorsProfiles[index].github_org,
      })),
    {
      connect: { users: users },
    }
  )

  // add zkvms
  const { zkvms } = await seed.zkvms(
    (x) =>
      x(zkvmsData.length, ({ index }) => ({
        name: zkvmsData[index].name,
        isa: zkvmsData[index].isa,
        frontend_url: zkvmsData[index].frontend,
        repo_url: zkvmsData[index].repo_url,
        continuations: zkvmsData[index].continuations,
        parallelizable_proving: zkvmsData[index].parallelizable_proving,
        precompiles: zkvmsData[index].precompiles,
      })),
    {
      connect: { vendors },
    }
  )

  // zkvm metrics
  await seed.zkvm_performance_metrics((x) => x(zkvmsData.length), {
    connect: { zkvms },
  })
  await seed.zkvm_security_metrics((x) => x(zkvmsData.length), {
    connect: { zkvms },
  })

  // add zkvm_versions, set 2 versions for each zkvm
  const { zkvm_versions } = await seed.zkvm_versions(
    (x) =>
      x(2 * zkvmsData.length, ({ index }) => ({
        version: `0.${index}.${index}`,
        description: "Initial version",
      })),
    {
      connect: { zkvms },
    }
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

  const { cloud_instances } = await seed.cloud_instances((x) =>
    x(3, ({ index }) => ({
      instance_name: ["t3.medium", "t3.large", "t3.xlarge"][index],
      provider: "aws",
      hourly_price: [0.0416, 0.0832, 0.1664][index],
      region: ["us-east-1", "us-east-2", "us-west-1"][index],
    }))
  )

  for (const user of users) {
    // const userIndex = users.indexOf(user)
    // const profile = proverProfiles[userIndex]

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
            is_multi_machine: copycat.bool(seed),
            is_open_source: copycat.bool(seed),
            software_link: copycat.oneOf(seed, [faker.internet.url(), null]),
          }
        }),
      {
        connect: { teams: [{ id: user.id }] },
      }
    )

    const { cluster_versions } = await seed.cluster_versions(
      (x) =>
        x(2, ({ index }) => ({
          version: `v0.${index}`,
          description: "Initial version",
        })),
      { connect: { clusters, zkvm_versions, teams: [{ id: user.id }] } }
    )

    const { machines } = await seed.machines((x) =>
      x(5, ({ seed }) => ({
        cpu_cores: copycat.int(seed, { min: 1, max: 10 }),
        cpu_model: faker.lorem.word(),
        gpu_count: [copycat.int(seed, { min: 0, max: 10 })],
        gpu_models: [faker.lorem.word()],
        memory_gb: copycat.int(seed, { min: 1, max: 10 }),
        storage_gb: copycat.int(seed, { min: 1, max: 10 }),
      }))
    )

    await seed.cluster_machines(
      (x) =>
        x(2, ({ seed }) => ({
          instance_count: copycat.int(seed, { min: 1, max: 10 }),
          machine_count: copycat.int(seed, { min: 1, max: 10 }),
        })),
      { connect: { machines, cluster_versions, cloud_instances } }
    )

    await seed.proofs(
      (x) =>
        x(blocks.length, ({ seed }) => {
          const status = copycat.oneOfString(seed, [
            "proved",
            "proving",
            "queued",
          ])

          const queued_timestamp = faker.date.recent({
            days: 10,
            refDate: new Date(),
          })

          let proving_timestamp: Date | null = null
          if (status === "proving") {
            proving_timestamp = setSeconds(
              queued_timestamp,
              copycat.int(seed, { min: 1, max: 10 })
            )
          }

          let proved_timestamp: Date | null = null
          if (status === "proved") {
            proving_timestamp = setSeconds(
              queued_timestamp,
              copycat.int(seed, { min: 1, max: 10 })
            )
            proved_timestamp = setSeconds(
              proving_timestamp!,
              copycat.int(seed + 1, { min: 1, max: 10 })
            )
          }

          return {
            proof_id: ({ seed }) => copycat.int(seed, { min: 1, max: 1000000 }),
            proving_time: ({ seed }) =>
              copycat.int(seed, { min: 1000, max: 10000 }),
            proof_status: status,
            proving_cycles: ({ seed }) =>
              copycat.int(seed, { min: 100000, max: 1000000 }),
            size_bytes: ({ seed }) =>
              copycat.int(seed, { min: 2 ** 15, max: 2 ** 23 }),
            team_id: user.id,
            proved_timestamp: () => proved_timestamp?.toISOString() ?? null,
            proving_timestamp: () => proving_timestamp?.toISOString() ?? null,
            queued_timestamp: () => queued_timestamp.toISOString(),
          }
        }),
      { connect: { blocks, cluster_versions, teams: [{ id: user.id }] } }
    )
  }

  process.exit()
}

main()
