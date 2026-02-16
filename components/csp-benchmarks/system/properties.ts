import { getProverKey } from "../metrics"

import type { Metrics } from "@/lib/api/csp-benchmarks"

export interface SystemProperties {
  proverKey: string
  name: string
  feat: string | undefined
  is_zkvm: boolean
  proving_system: string | undefined
  field_curve: string | undefined
  iop: string | undefined
  pcs: string | undefined
  arithm: string | undefined
  is_zk: boolean | undefined
  security_bits: number | undefined
  is_pq: boolean | undefined
  is_maintained: boolean | undefined
  is_audited: "audited" | "not_audited" | "partially_audited" | undefined
  isa: string | undefined
  github: string | undefined
  website: string | undefined
}

interface ProverMeta {
  github: string
  website?: string
}

const proverMetadata: Partial<Record<string, ProverMeta>> = {
  risc0: { github: "risc0/risc0", website: "https://risczero.com" },
  miden: { github: "0xmiden/miden-vm", website: "https://miden.xyz" },
  "cairo-m": {
    github: "starkware-libs/cairo",
    website: "https://starkware.co",
  },
  nexus: { github: "nexus-xyz/nexus-zkvm", website: "https://nexus.xyz" },
  ligetron: { github: "ligetron/ligetron" },
  binius64: {
    github: "irreducibleoss/binius",
    website: "https://irreducible.com",
  },
  plonky2: { github: "0xpolygonzero/plonky2" },
  circom: { github: "iden3/circom", website: "https://iden3.io" },
  barretenberg: {
    github: "aztecprotocol/aztec-packages",
    website: "https://aztec.network",
  },
  expander: {
    github: "polyhedrazk/expander",
    website: "https://polyhedra.network",
  },
  provekit: { github: "worldfnd/provekit", website: "https://world.org" },
  "rookie-numbers": { github: "clementwalter/rookie-numbers" },
  spartan2: { github: "microsoft/spartan2" },
}

export function buildSystemPropertiesFromRow(row: Metrics): SystemProperties {
  const meta = proverMetadata[row.name]
  return {
    proverKey: getProverKey(row),
    name: row.name,
    feat: row.feat,
    is_zkvm: row.is_zkvm,
    proving_system: row.proving_system,
    field_curve: row.field_curve,
    iop: row.iop,
    pcs: row.pcs,
    arithm: row.arithm,
    is_zk: row.is_zk,
    security_bits: row.security_bits,
    is_pq: row.is_pq,
    is_maintained: row.is_maintained,
    is_audited: row.is_audited,
    isa: row.isa,
    github: meta?.github,
    website: meta?.website,
  }
}
