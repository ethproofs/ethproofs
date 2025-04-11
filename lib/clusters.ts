// We had to shorten the names of the relations to avoid a bug in
// drizzle: https://github.com/drizzle-team/drizzle-orm/issues/2066
// TODO: remove it once it's fixed

export const tmp_renameClusterConfiguration = <
  T extends object,
  U extends object,
  V extends object,
>(
  cluster: T & {
    cc: (U & { ci: V })[]
  }
) => {
  const { cc, ...clusterWithoutCC } = cluster
  return {
    ...clusterWithoutCC,
    cluster_configuration: cc.map(tmp_renameCloudInstances),
  }
}

export const tmp_renameCloudInstances = <T extends object, U extends object>(
  clusterConfig: T & { ci: U }
) => {
  const { ci, ...clusterConfigWithoutCI } = clusterConfig
  return {
    ...clusterConfigWithoutCI,
    cloud_instance: ci,
  }
}
