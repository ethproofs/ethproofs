import Link from "@/components/ui/link"

import { CloudInstancesTable } from "./cloud-instances-table"

import { getInstances } from "@/lib/api/cloud-instances"

export default async function CloudInstancesPage() {
  const instances = await getInstances()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Cloud Instances</h1>
        <div className="flex flex-col gap-2">
          <p>
            This table helps you find the correct instance reference ID for use
            in our <Link href="/api.html">API</Link>. Each row shows available
            cloud instance types across different providers.
          </p>
          <p>
            The <span className="text-primary-light">instance name</span> column
            displays the exact identifier you should use when configuring
            clusters through our API calls.
          </p>
        </div>
      </div>

      <CloudInstancesTable instances={instances} />
    </div>
  )
}
