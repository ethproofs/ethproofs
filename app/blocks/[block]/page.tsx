import { Box, Clock, Coins, Cpu, Hourglass, Layers, Timer } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BasicTabs } from "@/components/BasicTabs"
import CopyButton from "@/components/CopyButton"
import Null from "@/components/Null"
import DownloadAllButton from "@/components/proof-buttons/DownloadAllButton"
import ProofList from "@/components/ProofList"
import ProofStatus from "@/components/ProofStatus"
import { HidePunctuation } from "@/components/StylePunctuation"
import EthproofsIcon from "@/components/svgs/ethproofs-icon.svg"
import Timestamp from "@/components/Timestamp"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroItem, HeroItemLabel, HeroTitle } from "@/components/ui/hero"
import {
  MetricBox,
  MetricInfo,
  MetricLabel,
  MetricValue,
} from "@/components/ui/metric"
import { Separator } from "@/components/ui/separator"

import { truncateHash } from "@/lib/utils"

import {
  getAvailabilityMetrics,
  getBlockFeeMetrics,
} from "@/app/block/[block]/utils"
import { fetchBlock } from "@/lib/api/blocks"
import { timestampToEpoch, timestampToSlot } from "@/lib/beaconchain"
import { isBlockHash } from "@/lib/blocks"
import { getMetadata } from "@/lib/metadata"
import { formatNumber } from "@/lib/number"
import {
  getCostPerMgasStats,
  getCostPerProofStats,
  getProofsPerStatusCount,
  getProvingTimeStats,
  getTotalTTPStats,
} from "@/lib/proofs"

export type BlockDetailsPageProps = {
  params: Promise<{ block: string }>
}

export async function generateMetadata({
  params,
}: BlockDetailsPageProps): Promise<Metadata> {
  const { block } = await params

  if (isNaN(+block)) throw new Error()

  const blockData = await fetchBlock(
    isBlockHash(block)
      ? {
          hash: block,
        }
      : {
          blockNumber: +block,
        }
  )

  return getMetadata({
    title: `Block ${blockData ? blockData.block_number : block}`,
  })
}

export default async function BlockDetailsPage({
  params,
}: BlockDetailsPageProps) {
  const blockNumber = (await params).block

  if (isNaN(+blockNumber)) throw new Error()

  const block = await fetchBlock(
    isBlockHash(blockNumber)
      ? {
          hash: blockNumber,
        }
      : {
          blockNumber: +blockNumber,
        }
  )
  if (!block) notFound()

  const { timestamp, block_number, gas_used, proofs, hash } = block

  const proofsPerStatusCount = getProofsPerStatusCount(proofs)

  const singleMachineProofs = proofs.filter(
    (proof) => !proof.cluster_version?.cluster.is_multi_machine
  )

  const multiMachineProofs = proofs.filter(
    (proof) => proof.cluster_version?.cluster.is_multi_machine
  )

  const singleMachineStats = {
    costPerProofStats: getCostPerProofStats(singleMachineProofs),
    costPerMgasStats: getCostPerMgasStats(singleMachineProofs, gas_used),
    provingTimeStats: getProvingTimeStats(singleMachineProofs),
    totalTTPStats: getTotalTTPStats(singleMachineProofs, timestamp),
  }

  const multiMachineStats = {
    costPerProofStats: getCostPerProofStats(multiMachineProofs),
    costPerMgasStats: getCostPerMgasStats(multiMachineProofs, gas_used),
    provingTimeStats: getProvingTimeStats(multiMachineProofs),
    totalTTPStats: getTotalTTPStats(multiMachineProofs, timestamp),
  }

  const singleMachineMetrics = getAvailabilityMetrics(singleMachineStats)
  const multiMachineMetrics = getAvailabilityMetrics(multiMachineStats)

  const singleMachineBlockFeeMetrics = getBlockFeeMetrics(singleMachineStats)
  const multiMachineBlockFeeMetrics = getBlockFeeMetrics(multiMachineStats)

  return (
    <div className="mx-auto max-w-screen-xl space-y-20 px-6 md:px-8 [&>section]:w-full">
      <HeroTitle className="mx-auto mb-24 mt-16 w-fit items-center gap-4 md:mt-24">
        <Box strokeWidth="1" className="size-[4.5rem] shrink-0 text-primary" />
        <div className="max-w-[14rem]">
          <h1 className="">
            <p className="font-sans text-sm font-normal text-body-secondary">
              block height
            </p>
            <p className="text-3xl font-semibold tracking-wide">
              <HidePunctuation>{formatNumber(block_number)}</HidePunctuation>
            </p>
          </h1>
          <div className="flex items-center gap-2 truncate">
            <div className="text-sm font-normal text-body-secondary">
              {truncateHash(hash ?? "", 12, 12)}
            </div>
            {hash ? <CopyButton message={hash} /> : <Null />}
          </div>
        </div>
      </HeroTitle>

      <section className="grid w-fit grid-cols-2 gap-x-8 gap-y-4 px-6 md:grid-cols-[auto,auto,auto,auto]">
        <HeroItem className="row-span-2 grid grid-rows-subgrid place-items-center gap-y-1">
          <HeroItemLabel>
            <Clock className="size-4" /> timestamp
          </HeroItemLabel>
          {timestamp ? <Timestamp>{timestamp}</Timestamp> : <Null />}
        </HeroItem>

        <HeroItem className="row-span-2 grid grid-rows-subgrid place-items-center gap-y-1">
          <HeroItemLabel>
            <Cpu className="size-4" /> gas used
          </HeroItemLabel>
          <p className="tracking-wide">
            {gas_used ? (
              <HidePunctuation>{formatNumber(gas_used)}</HidePunctuation>
            ) : (
              <Null />
            )}
          </p>
        </HeroItem>

        <HeroItem className="row-span-2 grid grid-rows-subgrid place-items-center gap-y-1">
          <HeroItemLabel>
            <Layers className="size-4" /> slot
          </HeroItemLabel>
          <p className="tracking-wide">
            {timestamp ? (
              <HidePunctuation>
                {formatNumber(timestampToSlot(timestamp))}
              </HidePunctuation>
            ) : (
              <Null />
            )}
          </p>
        </HeroItem>

        <HeroItem className="row-span-2 grid grid-rows-subgrid place-items-center gap-y-1">
          <HeroItemLabel>
            <Hourglass className="size-4" /> epoch
          </HeroItemLabel>
          <p className="tracking-wide">
            {timestamp ? (
              <HidePunctuation>
                {formatNumber(timestampToEpoch(timestamp))}
              </HidePunctuation>
            ) : (
              <Null />
            )}
          </p>
        </HeroItem>
      </section>

      <section className="flex flex-col gap-8 xl:flex-row">
        <Card className="flex-1">
          <CardHeader className="flex flex-row justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-lg font-normal [&>svg]:shrink-0">
              <Timer className="size-5" /> proof availability
            </CardTitle>
            <MetricBox className="py-0">
              <MetricValue className="font-normal">
                <ProofStatus statusCount={proofsPerStatusCount} />
              </MetricValue>
            </MetricBox>
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            <div className="text-sm text-primary sm:text-start">
              1x4090 performance
            </div>
            <div className="grid grid-cols-1 place-items-center gap-x-8 text-center sm:grid-cols-2 sm:place-items-start sm:text-start lg:grid-cols-4 xl:grid-cols-2">
              {singleMachineMetrics.map(
                ({ key, label, description, value }) => (
                  <MetricBox
                    key={"single-" + key}
                    className="row-span-2 grid grid-rows-subgrid"
                  >
                    <MetricLabel className="flex items-stretch lowercase">
                      <MetricInfo
                        label={
                          <span className="h-full lowercase">{label}</span>
                        }
                      >
                        {description}
                      </MetricInfo>
                    </MetricLabel>
                    <MetricValue className="font-normal">{value}</MetricValue>
                  </MetricBox>
                )
              )}
            </div>
            <div className="mt-4 text-center text-sm text-primary sm:text-start">
              multi-GPU performance
            </div>
            <div className="grid grid-cols-1 place-items-center gap-x-8 text-center sm:grid-cols-2 sm:place-items-start sm:text-start lg:grid-cols-4 xl:grid-cols-2">
              {multiMachineMetrics.map(({ key, label, description, value }) => (
                <MetricBox
                  key={"multi-" + key}
                  className="row-span-2 grid grid-rows-subgrid"
                >
                  <MetricLabel className="flex items-stretch lowercase">
                    <MetricInfo
                      label={<span className="h-full lowercase">{label}</span>}
                    >
                      {description}
                    </MetricInfo>
                  </MetricLabel>
                  <MetricValue className="font-normal">{value}</MetricValue>
                </MetricBox>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="flex items-center gap-2 text-lg font-normal [&>svg]:shrink-0">
              <Coins className="size-5" /> proof costs
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            <div className="text-center text-sm text-primary sm:text-start">
              1x4090 performance
            </div>
            <div className="grid grid-cols-1 place-items-center gap-x-8 text-center sm:grid-cols-2 sm:place-items-start sm:text-start lg:grid-cols-4 xl:grid-cols-2">
              {singleMachineBlockFeeMetrics.map(
                ({ key, label, description, value }) => (
                  <MetricBox
                    key={key}
                    className="row-span-2 grid grid-rows-subgrid"
                  >
                    <MetricLabel>
                      <MetricInfo
                        label={<span className="lowercase">{label}</span>}
                      >
                        {description}
                      </MetricInfo>
                    </MetricLabel>
                    <MetricValue className="font-normal">{value}</MetricValue>
                  </MetricBox>
                )
              )}
            </div>
            <div className="mt-4 text-center text-sm text-primary sm:text-start">
              multi-GPU performance
            </div>
            <div className="grid grid-cols-1 place-items-center gap-x-8 text-center sm:grid-cols-2 sm:place-items-start sm:text-start lg:grid-cols-4 xl:grid-cols-2">
              {multiMachineBlockFeeMetrics.map(
                ({ key, label, description, value }) => (
                  <MetricBox
                    key={key}
                    className="row-span-2 grid grid-rows-subgrid"
                  >
                    <MetricLabel>
                      <MetricInfo
                        label={<span className="lowercase">{label}</span>}
                      >
                        {description}
                      </MetricInfo>
                    </MetricLabel>
                    <MetricValue className="font-normal">{value}</MetricValue>
                  </MetricBox>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between md:mb-4">
          <h2 className="flex items-center gap-2 text-lg font-normal text-primary">
            <EthproofsIcon className="size-5" /> proofs
          </h2>
          {proofs.length >= 1 && hash && (
            <DownloadAllButton blockHash={hash} className="max-md:hidden" />
          )}
        </div>

        <BasicTabs
          className="px-0"
          contentLeft={<ProofList proofs={multiMachineProofs} block={block} />}
          contentRight={
            <ProofList proofs={singleMachineProofs} block={block} />
          }
        />
      </section>
    </div>
  )
}
