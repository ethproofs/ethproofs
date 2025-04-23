import type { ClusterDetails } from "./types"

export const demoClusterDetails: ClusterDetails[] = [
  {
    gpuCount: 2,
    clusterName: "Cluster A",
    machines: [
      {
        machineName: "Machine A1",
        cpuCount: 4,
        gpuRam: 8 * 2 ** 30,
        cpuRam: 8 * 2 ** 30,
      },
      {
        machineName: "Machine A2",
        cpuCount: 8,
        gpuRam: 16 * 2 ** 30,
        cpuRam: 16 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 8,
    clusterName: "Cluster B",
    machines: [
      {
        machineName: "Machine B1",
        cpuCount: 16,
        gpuRam: 32 * 2 ** 30,
        cpuRam: 32 * 2 ** 30,
      },
      {
        machineName: "Machine B2",
        cpuCount: 8,
        gpuRam: 24 * 2 ** 30,
        cpuRam: 24 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 8,
    clusterName: "Cluster C",
    machines: [
      {
        machineName: "Machine C1",
        cpuCount: 4,
        gpuRam: 12 * 2 ** 30,
        cpuRam: 12 * 2 ** 30,
      },
      {
        machineName: "Machine C2",
        cpuCount: 6,
        gpuRam: 16 * 2 ** 30,
        cpuRam: 16 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 4,
    clusterName: "Cluster D",
    machines: [
      {
        machineName: "Machine D1",
        cpuCount: 2,
        gpuRam: 4 * 2 ** 30,
        cpuRam: 4 * 2 ** 30,
      },
      {
        machineName: "Machine D2",
        cpuCount: 4,
        gpuRam: 8 * 2 ** 30,
        cpuRam: 8 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 1,
    clusterName: "Cluster E",
    machines: [
      {
        machineName: "Machine E1",
        cpuCount: 1,
        gpuRam: 2 * 2 ** 30,
        cpuRam: 2 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 16,
    clusterName: "Cluster F",
    machines: [
      {
        machineName: "Machine F1",
        cpuCount: 32,
        gpuRam: 64 * 2 ** 30,
        cpuRam: 64 * 2 ** 30,
      },
      {
        machineName: "Machine F2",
        cpuCount: 16,
        gpuRam: 48 * 2 ** 30,
        cpuRam: 48 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 32,
    clusterName: "Cluster G",
    machines: [
      {
        machineName: "Machine G1",
        cpuCount: 64,
        gpuRam: 128 * 2 ** 30,
        cpuRam: 128 * 2 ** 30,
      },
      {
        machineName: "Machine G2",
        cpuCount: 32,
        gpuRam: 96 * 2 ** 30,
        cpuRam: 96 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 8,
    clusterName: "Cluster H",
    machines: [
      {
        machineName: "Machine H1",
        cpuCount: 8,
        gpuRam: 16 * 2 ** 30,
        cpuRam: 16 * 2 ** 30,
      },
      {
        machineName: "Machine H2",
        cpuCount: 8,
        gpuRam: 16 * 2 ** 30,
        cpuRam: 16 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 8,
    clusterName: "Cluster I",
    machines: [
      {
        machineName: "Machine I1",
        cpuCount: 12,
        gpuRam: 24 * 2 ** 30,
        cpuRam: 24 * 2 ** 30,
      },
      {
        machineName: "Machine I2",
        cpuCount: 16,
        gpuRam: 32 * 2 ** 30,
        cpuRam: 32 * 2 ** 30,
      },
    ],
  },
  {
    gpuCount: 4,
    clusterName: "Cluster J",
    machines: [
      {
        machineName: "Machine J1",
        cpuCount: 4,
        gpuRam: 8 * 2 ** 30,
        cpuRam: 8 * 2 ** 30,
      },
      {
        machineName: "Machine J2",
        cpuCount: 6,
        gpuRam: 12 * 2 ** 30,
        cpuRam: 12 * 2 ** 30,
      },
    ],
  },
]

export const demoProverAccordionDetails = Array(9).fill({
  clusterDetails: demoClusterDetails,
})
