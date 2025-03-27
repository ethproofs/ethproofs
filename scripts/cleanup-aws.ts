import aws from "../raw_aws.json"

type Aws = (typeof aws)[number]

const cleanupAws = (aws: Aws) => {
  return {
    instance_name: aws.instance_type,
    cpu_arch: aws.cpu_arch,
    cpu_cores: parseInt(aws.cpu_cores.split(" ")[0]),
    cpu_name: aws.cpu_name,
    memory: parseFloat(aws.memory.replace(" GiB", "")),
    disk_name: aws.disk_name,
    gpu_name: aws.gpu_name,
    gpu_memory: parseFloat(aws.gpu_memory.replace(" GiB", "")),
    gpu_count: aws.gpu_count,
    region: "us-east-1",
    hourly_price: parseFloat(
      aws.hourly_price.replace("$", "").replace(" hourly", "")
    ),
    snapshot_date: "2025-03-25",
    provider: "aws",
  }
}

const cleanedAws = aws
  .filter((aws) => aws.hourly_price !== "unavailable")
  .map(cleanupAws)

console.log(JSON.stringify(cleanedAws, null, 2))
