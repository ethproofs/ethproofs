import { AwsInstance, ClusterBase, ClusterConfig } from "./types"

// We had to shorten the names of the relations to avoid a bug in
// drizzle: https://github.com/drizzle-team/drizzle-orm/issues/2066
// TODO: remove it once it's fixed

export const tmp_renameClusterConfiguration = <
  T extends object,
  U extends object,
  V extends object,
>(
  cluster: T & {
    cc: (U & { aip: V })[]
  }
) => {
  const { cc, ...clusterWithoutCC } = cluster
  return {
    ...clusterWithoutCC,
    cluster_configuration: cc.map(tmp_renameAwsInstancePricing),
  }
}

export const tmp_renameAwsInstancePricing = <
  T extends object,
  U extends object,
>(
  clusterConfig: T & { aip: U }
) => {
  const { aip, ...clusterConfigWithoutAIP } = clusterConfig
  return {
    ...clusterConfigWithoutAIP,
    aws_instance_pricing: aip,
  }
}
