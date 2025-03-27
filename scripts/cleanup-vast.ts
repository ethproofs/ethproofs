import vast from "../raw_vast.json"

type Vast = (typeof vast)[number]

const cleanupVast = (vast: Vast) => {
  return {
    instance_name: vast.id.toString(),
    cpu_arch: vast.cpu_arch,
    cpu_cores: vast.cpu_cores,
    cpu_effective_cores: vast.cpu_cores_effective,
    cpu_name: vast.cpu_name,
    memory: vast.cpu_ram / 1024,
    disk_name: vast.disk_name,
    disk_space: vast.disk_space,
    gpu_arch: vast.gpu_arch,
    gpu_name: vast.gpu_name,
    gpu_memory: vast.gpu_ram,
    gpu_count: vast.num_gpus,
    mobo_name: vast.mobo_name,
    region: vast.geolocation
      .split(",")
      .filter(Boolean)
      .map((s) => s.trim())
      .join(", "),
    hourly_price: vast.dph_total,
    snapshot_date: "2025-03-25",
    provider: "vastai",
  }
}

const cleanedVast = vast.map(cleanupVast)

console.log(JSON.stringify(cleanedVast, null, 2))
