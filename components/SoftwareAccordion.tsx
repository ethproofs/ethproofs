import Image from "next/image"
import { type AccordionItemProps } from "@radix-ui/react-accordion"

import {
  SoftwareItem,
  Vendor,
  Zkvm,
  ZkvmMetrics,
  ZkvmVersion,
} from "@/lib/types"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { ButtonLink } from "./ui/button"
import Link from "./ui/link"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import { Progress } from "./ui/progress"
import Pizza from "./Pizza"
import SoftwareDetails from "./SoftwareDetails"

import { formatShortDate } from "@/lib/date"
import {
  getZkvmMetricLabel,
  getZkvmMetricSeverityLevels,
  getZkvmsMetrics,
} from "@/lib/metrics"
import { getSlices, getZkvmsWithUsage } from "@/lib/zkvms"
import { ZKVM_THRESHOLDS } from "@/lib/constants"

const SoftwareAccordionItem = ({
  value,
  zkvm,
  metrics,
}: Pick<AccordionItemProps, "value"> & {
  zkvm: Zkvm & {
    versions: ZkvmVersion[]
    vendor: Vendor
    totalClusters: number
    activeClusters: number
  }
  metrics: ZkvmMetrics
}) => {
  const severityLevels = getZkvmMetricSeverityLevels(metrics)

  const items: SoftwareItem[] = [
    // Section 1 - Top charts
    {
      id: "verification-time",
      label: "verification times",
      className: "col-span-2 col-start-1 row-start-1 flex-1 py-4 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.verificationTime,
      position: 7,
      chartInfo: {
        bestThreshold: ZKVM_THRESHOLDS.verification_ms.yellow,
        worstThreshold: ZKVM_THRESHOLDS.verification_ms.red,
        unit: "ms",
        value: Number(metrics.verification_ms),
      },
    },
    {
      id: "proof-size",
      label: "proof size",
      className: "col-span-2 col-start-4 row-start-1 flex-1 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.proofSize,
      position: 0,
      chartInfo: {
        bestThreshold: ZKVM_THRESHOLDS.size_bytes.yellow / 1024,
        worstThreshold: ZKVM_THRESHOLDS.size_bytes.red / 1024,
        unit: "kB",
        value: Number(metrics.size_bytes) / 1024,
      },
    },
    // Section 2 - Left
    {
      id: "protocol-soundness",
      label: "protocol soundness",
      className: "col-start-2 row-start-2 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.protocolSoundness,
      position: 6,
      value: getZkvmMetricLabel(
        severityLevels.protocolSoundness,
        "protocol_soundness"
      ),
    },
    {
      id: "implementation-soundness",
      label: "implementation soundness",
      className: "col-start-2 row-start-3 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.implementationSoundness,
      position: 5,
      value: getZkvmMetricLabel(
        severityLevels.implementationSoundness,
        "implementation_soundness"
      ),
    },
    {
      id: "evm-stf-bytecode",
      label: "EVM STF bytecode",
      className: "col-start-2 row-start-4 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.evmStfBytecode,
      position: 4,
      value: getZkvmMetricLabel(
        severityLevels.evmStfBytecode,
        "evm_stf_bytecode"
      ),
    },
    // Section 3 - Right
    {
      id: "security-target",
      label: "security target",
      className: "col-start-4 row-start-2 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.securityTarget,
      position: 1,
      value: getZkvmMetricLabel(
        severityLevels.securityTarget,
        "security_target_bits"
      ),
    },
    {
      id: "quantum-security",
      label: "quantum security",
      className: "col-start-4 row-start-3 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.quantumSecurity,
      position: 2,
      value: getZkvmMetricLabel(
        severityLevels.quantumSecurity,
        "quantum_security"
      ),
    },
    {
      id: "max-bounty-amount",
      label: "bounties",
      className: "col-start-4 row-start-4 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.maxBountyAmount,
      position: 3,
      value: getZkvmMetricLabel(
        severityLevels.maxBountyAmount,
        "max_bounty_amount"
      ),
    },
  ]

  return (
    <AccordionItem value={value} className="col-span-5 grid grid-cols-subgrid">
      <div className="col-span-5 grid grid-cols-subgrid items-center gap-12 border-b px-6 hover:bg-primary/5 dark:hover:bg-primary/10">
        <div className="col-start-1 flex items-center gap-3">
          <Link href={`/zkvms/${zkvm.slug}`} className="hover:underline">
            <span className="block font-mono text-2xl text-primary">
              {zkvm.name}
            </span>
          </Link>
          <span className="block font-mono text-sm italic text-body-secondary">
            by
          </span>
          <Link
            href={`/teams/${zkvm.vendor.slug}`}
            className="-m-1 rounded p-1 hover:bg-primary/10"
          >
            <Image
              // TODO: add fallback logo
              src={zkvm.vendor.logo_url ?? ""}
              alt="Succinct logo"
              height={16}
              width={16}
              style={{ height: "1rem", width: "auto" }}
              className="dark:invert"
            />
          </Link>
        </div>
        <div id="version" className="col-start-2">
          {zkvm.versions[0].version}
        </div>
        <div id="isa" className="col-start-3">
          {zkvm.isa}
        </div>
        <div id="used-by" className="relative col-start-4 min-w-16">
          <div className="w-full text-center">
            {zkvm.activeClusters}/
            <span className="text-xs">{zkvm.totalClusters}</span>
          </div>
          <Progress
            value={(zkvm.activeClusters / zkvm.totalClusters) * 100}
            className="absolute -bottom-1 left-0 h-[2px] w-full"
          />
        </div>

        <AccordionTrigger className="col-start-5 my-2 h-fit gap-2 rounded-full border-2 border-primary bg-background-highlight p-0.5 pe-2 text-primary [&>svg]:size-6">
          <Pizza slices={getSlices(items)} disableEffects />
        </AccordionTrigger>
      </div>
      <AccordionContent className="col-span-full border-b bg-gradient-to-t from-background-active p-0">
        <SoftwareDetails items={items} />

        <div className="flex justify-center gap-16 p-8 pt-0">
          <ButtonLink variant="outline" href={`/zkvms/${zkvm.slug}`}>
            See all details
          </ButtonLink>
          <div>
            <span className="text-xs italic text-body-secondary">
              Last updated
            </span>{" "}
            <span className="text-xs uppercase text-body">
              {/* // TODO: Get and use last updated date */}
              {formatShortDate(new Date())}
            </span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

const SoftwareAccordion = async () => {
  const zkvms = await getZkvmsWithUsage()
  const metricsByZkvmId = await getZkvmsMetrics()

  return (
    <Accordion
      type="multiple"
      className="grid w-full grid-cols-[1fr_repeat(4,_auto)]"
    >
      <div className="col-span-5 grid grid-cols-subgrid text-center">
        <MetricBox className="col-start-2">
          <MetricLabel>
            <MetricInfo label="Version">TODO: Popover details</MetricInfo>
          </MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-3">
          <MetricLabel>
            <MetricInfo label="ISA">
              Instruction set architecture
              <br />
              TODO: Popover details
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-4">
          <MetricLabel>
            <MetricInfo label="Used by">TODO: Popover details</MetricInfo>
          </MetricLabel>
        </MetricBox>
      </div>
      {zkvms.map((zkvm) => (
        <SoftwareAccordionItem
          key={zkvm.id}
          value={"item-" + zkvm.id}
          zkvm={zkvm}
          metrics={metricsByZkvmId[zkvm.id]}
        />
      ))}
    </Accordion>
  )
}

SoftwareAccordion.displayName = "SoftwareAccordion"

export default SoftwareAccordion
