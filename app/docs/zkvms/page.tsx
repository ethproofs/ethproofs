import Link from "@/components/ui/link"

import { SITE_REPO } from "@/lib/constants"

import { ZkvmsDocsTable } from "./zkvms-docs-table"

import { getZkvms } from "@/lib/api/zkvms"

export default async function ZkvmsPage() {
  const zkvms = await getZkvms()
  const repoUrl = new URL(SITE_REPO, "https://github.com")

  const issuesUrl = new URL(`${repoUrl}/issues/new`, "https://github.com")
  issuesUrl.searchParams.set("title", "Add a new zkVM")
  issuesUrl.searchParams.set(
    "body",
    "Please add the following zkVM to the list:"
  )

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="text-2xl">zkVMs</span>
        <div className="flex flex-col gap-2">
          <p>
            This is the current list of zero-knowledge Virtual Machines (zkVMs)
            integrated into Ethproofs.
          </p>
          <p>
            The <span className="text-primary-light">id column</span> in this
            table serves as a unique identifier for each zkVM version and must
            be used when creating or modifying clusters through the{" "}
            <Link href="/api.html">API</Link> endpoints.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <ZkvmsDocsTable zkvms={zkvms} />
      </div>

      <p className="text-sm text-muted-foreground">
        If you&apos;re looking for a zkVM version that&apos;s not listed here,
        please <Link href={issuesUrl.toString()}>open a GitHub issue</Link> and
        we&apos;ll work on adding it to the list.
      </p>
    </div>
  )
}
