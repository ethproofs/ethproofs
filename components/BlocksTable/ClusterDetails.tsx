import type { Proof } from "@/lib/types"

const ClusterDetails = ({ proof }: { proof: Proof }) => {
  const { cluster_id, cluster } = proof
  if (!cluster) return "Cluster " + cluster_id.split("-")[0]
  const { cluster_description, cluster_hardware, cluster_name } = cluster

  return (
    <div className="text-wrap">
      {cluster_name && (
        <span className="block text-lg font-semibold">{cluster_name}</span>
      )}
      {cluster_hardware && (
        <span className="block">
          <span className="font-semibold">Hardware:</span> {cluster_hardware}
        </span>
      )}
      {cluster_description && (
        <span className="block">
          <span className="font-semibold">Description:</span>{" "}
          {cluster_description}
        </span>
      )}
    </div>
  )
}

export default ClusterDetails
