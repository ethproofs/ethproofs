import {
  addDays,
  differenceInMilliseconds,
  startOfDay,
  startOfYesterday,
} from "date-fns"

import type { SummaryItem } from "@/lib/types"

import { BasicTabs } from "../BasicTabs"
import KPIs from "../KPIs"
import SimpleBlockTable from "../SimpleBlockTable"
import { ButtonLink } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"

import { fetchProofsPerStatusCount, lastProvedProof } from "@/lib/api/proofs"
import { prettyMs } from "@/lib/time"

const BlocksSection = async () => {
  const now = new Date()
  const yesterday = startOfYesterday()
  const thirtyDaysAgo = startOfDay(addDays(now, -30))

  const [lastProof, proofsPerStatusCount] = await Promise.all([
    lastProvedProof(),
    fetchProofsPerStatusCount(yesterday, now),
  ])

  // TODO:TEAM - run this in parallel with the other queries once we fix performance issues
  const recentProofsPerStatusCount = await fetchProofsPerStatusCount(
    thirtyDaysAgo,
    now
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
    <Card className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="flex items-center justify-between md:px-12 xl:flex-row max-xl:[&>div]:w-full">
        <CardTitle className="text-3xl font-normal tracking-[1px] max-xl:mt-8">
          latest blocks
        </CardTitle>
        <div>
          <KPIs items={blocksSummary} />
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-6">
        <BasicTabs
          contentRight={<SimpleBlockTable machineType="single" />}
          contentLeft={<SimpleBlockTable machineType="multi" />}
        />
      </CardContent>

      <CardFooter className="justify-center">
        <ButtonLink variant="outline" href="/blocks" className="min-w-40">
          see all
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}

export default BlocksSection
