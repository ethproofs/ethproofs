import type { ClusterDetails } from "./types"

const commonDetails = {
  clusterVersionDate: new Date().toISOString(),
  proverId: "1",
  proverName: "Prover A",
  zkvmId: 1,
  zkvmName: "Zkvm A",
  isOpenSource: true,
  avgCost: 100,
  avgTime: 1000000,
}

export const demoClusterDetails: ClusterDetails[] = [
  {
    clusterName: "Cluster A",
    ...commonDetails,
    machines: [
      {
        cpuModel: "Machine A1",
        gpuCount: 4,
        gpuRam: 8 * 2 ** 30,
        cpuRam: 8 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine A2",
        gpuCount: 8,
        gpuRam: 16 * 2 ** 30,
        cpuRam: 16 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    clusterName: "Cluster B",
    ...commonDetails,
    machines: [
      {
        cpuModel: "Machine B1",
        gpuCount: 4,
        gpuRam: 32 * 2 ** 30,
        cpuRam: 32 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine B2",
        gpuCount: 8,
        gpuRam: 24 * 2 ** 30,
        cpuRam: 24 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    clusterName: "Cluster C",
    ...commonDetails,
    machines: [
      {
        cpuModel: "Machine C1",
        gpuCount: 4,
        gpuRam: 12 * 2 ** 30,
        cpuRam: 12 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine C2",
        gpuCount: 8,
        gpuRam: 16 * 2 ** 30,
        cpuRam: 16 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    clusterName: "Cluster D",
    ...commonDetails,
    machines: [
      {
        cpuModel: "Machine D1",
        gpuCount: 4,
        gpuRam: 4 * 2 ** 30,
        cpuRam: 4 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine D2",
        gpuCount: 8,
        gpuRam: 8 * 2 ** 30,
        cpuRam: 8 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    clusterName: "Cluster E",
    ...commonDetails,
    machines: [
      {
        cpuModel: "Machine E1",
        gpuCount: 1,
        gpuRam: 2 * 2 ** 30,
        cpuRam: 2 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    clusterName: "Cluster F",
    ...commonDetails,
    machines: [
      {
        cpuModel: "Machine F1",
        gpuCount: 16,
        gpuRam: 64 * 2 ** 30,
        cpuRam: 64 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine F2",
        gpuCount: 16,
        gpuRam: 48 * 2 ** 30,
        cpuRam: 48 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    ...commonDetails,
    clusterName: "Cluster G",
    machines: [
      {
        cpuModel: "Machine G1",
        gpuCount: 32,
        gpuRam: 128 * 2 ** 30,
        cpuRam: 128 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine G2",
        gpuCount: 32,
        gpuRam: 96 * 2 ** 30,
        cpuRam: 96 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    ...commonDetails,
    clusterName: "Cluster H",
    machines: [
      {
        cpuModel: "Machine H1",
        gpuCount: 8,
        gpuRam: 16 * 2 ** 30,
        cpuRam: 16 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine H2",
        gpuCount: 8,
        gpuRam: 16 * 2 ** 30,
        cpuRam: 16 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    ...commonDetails,
    clusterName: "Cluster I",
    machines: [
      {
        cpuModel: "Machine I1",
        gpuCount: 12,
        gpuRam: 24 * 2 ** 30,
        cpuRam: 24 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine I2",
        gpuCount: 16,
        gpuRam: 32 * 2 ** 30,
        cpuRam: 32 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
  {
    ...commonDetails,
    clusterName: "Cluster J",
    machines: [
      {
        cpuModel: "Machine J1",
        gpuCount: 4,
        gpuRam: 8 * 2 ** 30,
        cpuRam: 8 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
      {
        cpuModel: "Machine J2",
        gpuCount: 6,
        gpuRam: 12 * 2 ** 30,
        cpuRam: 12 * 2 ** 30,
        cpuCount: 1,
        count: 1,
      },
    ],
  },
]
