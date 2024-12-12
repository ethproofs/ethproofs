import type { Proof } from "@/lib/types"

const ClusterDetails = ({ proof }: { proof: Proof }) => {
  const { cluster_id, cluster } = proof

  if (!cluster)
    return (
      <span className="block text-lg font-semibold">
        Cluster {cluster_id.split("-")[0]}
      </span>
    )

  const { description, hardware, nickname } = cluster

  return (
    <div className="text-wrap">
      {nickname && (
        <span className="block text-lg font-semibold">{nickname}</span>
      )}
      {hardware && (
        <span className="block">
          <span className="font-semibold">Hardware:</span> {hardware}
        </span>
      )}
      {description && (
        <span className="block">
          <span className="font-semibold">Description:</span> {description}
        </span>
      )}
    </div>
  )
}

export default ClusterDetails
