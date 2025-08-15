import type { ProofWithCluster } from "@/lib/types"

const ClusterDetails = ({ proof }: { proof: ProofWithCluster }) => {
  const { cluster_version } = proof
  const { cluster } = cluster_version
  const { description, hardware, nickname } = cluster

  return (
    <div className="text-wrap">
      {nickname && (
        <span className="block text-lg font-semibold">{nickname}</span>
      )}
      {hardware && (
        <span className="block">
          <span className="font-semibold">hardware:</span> {hardware}
        </span>
      )}
      {description && (
        <span className="block">
          <span className="font-semibold">description:</span> {description}
        </span>
      )}
    </div>
  )
}

export default ClusterDetails
