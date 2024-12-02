import type { Proof } from "@/lib/types"

const MachineDetails = ({ proof }: { proof: Proof }) => {
  const { machine_id, prover_machines: machines } = proof
  if (!machines) return "Machine " + machine_id.split("-")[0]
  const { machine_description, machine_hardware, machine_name } = machines
  return (
    <div className="text-wrap">
      <span className="block text-lg font-semibold">{machine_name}</span>
      <span className="block">
        <span className="font-semibold">Hardware:</span> {machine_hardware}
      </span>
      <span className="block">
        <span className="font-semibold">Description:</span>{" "}
        {machine_description}
      </span>
    </div>
  )
}

export default MachineDetails
