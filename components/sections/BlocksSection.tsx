import {
  addDays,
  differenceInMilliseconds,
  startOfDay,
  startOfYesterday,
} from "date-fns"

import { SummaryItem } from "@/lib/types"

import KPIs from "../KPIs"
import MachineTabs from "../MachineTabs"
import SimpleBlockTable from "../SimpleBlockTable"
import { ButtonLink } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"

import { fetchProofsPerStatusCount, lastProvedProof } from "@/lib/api/proofs"
import { prettyMs } from "@/lib/time"

const BlocksSection = async () => {
  const lastProof = await lastProvedProof()
  const proofsPerStatusCount = await fetchProofsPerStatusCount(
    startOfYesterday(),
    new Date()
  )
  const recentProofsPerStatusCount = await fetchProofsPerStatusCount(
    startOfDay(addDays(new Date(), -30)),
    new Date()
  )

  const provingCount = proofsPerStatusCount.find(
    (proof) => proof.proof_status === "proving"
  )
  const recentProvedCount = recentProofsPerStatusCount.find(
    (proof) => proof.proof_status === "proved"
  )

  const blocksSummary: SummaryItem[] = [
    {
      key: "proof-time",
      label: "since last proof",
      value: lastProof?.created_at
        ? prettyMs(differenceInMilliseconds(new Date(), lastProof?.created_at))
        : "N/A",
    },
    {
      key: "proving-count",
      label: "proving",
      value: provingCount?.count ?? 0,
    },
    {
      key: "recent-proving-count",
      label: "proven in last 30 days",
      value: new Intl.NumberFormat("en-US", {
        notation: "compact",
      }).format(recentProvedCount?.count ?? 0),
    },
  ]

  return (
    <Card variant="borderGradient" className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
        <CardTitle className="text-3xl font-normal tracking-[1px]">
          latest blocks
        </CardTitle>

        <div className="py-4">
          <KPIs items={blocksSummary} />
        </div>
      </CardHeader>

      <MachineTabs
        singleContent={<SimpleBlockTable machineType="single" />}
        multiContent={<SimpleBlockTable machineType="multi" />}
      />

      <div className="flex justify-center">
        <ButtonLink variant="outline" href="/blocks">
          See all
        </ButtonLink>
      </div>
    </Card>
  )
}

export default BlocksSection
