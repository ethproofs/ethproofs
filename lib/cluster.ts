interface ClusterWithProverType {
  prover_type?: { gpu_configuration: string } | null
}

export function isMultiGpuCluster(cluster: ClusterWithProverType): boolean {
  return cluster.prover_type?.gpu_configuration === "multi-gpu"
}
