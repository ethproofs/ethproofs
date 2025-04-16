import Link from "@/components/ui/link"

import { ZkvmsTable } from "./zkvms-table"

import { getZkvms } from "@/lib/api/zkvms"

export default async function ZkvmsPage() {
  const zkvms = await getZkvms()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">ZKVMs</h1>
        <div className="flex flex-col gap-2">
          <p>
            This is the current list of Zero-Knowledge Virtual Machines (zkVMs)
            tracked in ethproofs. The list is maintained in sync with the{" "}
            <Link href="https://github.com/rkdud007/awesome-zkvm">
              awesome-zkvm
            </Link>{" "}
            repository, a comprehensive collection of zkVM projects and
            resources.
          </p>
          <p>
            The <span className="text-primary-light">ID column</span> in this
            table serves as a unique identifier for each zkVM version and must
            be used when creating or modifying clusters through the{" "}
            <Link href="/api">API</Link> endpoints.
          </p>
        </div>
      </div>

      <ZkvmsTable zkvms={zkvms} />
    </div>
  )
}
