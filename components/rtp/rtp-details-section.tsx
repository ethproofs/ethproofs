"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { RoadmapDetails, RoadmapDetailsContent } from "./roadmap-details"
import { RtpCohortRules, RtpCohortRulesContent } from "./rtp-cohort-rules"
import { RtpCohortScores, RtpCohortScoresContent } from "./rtp-cohort-scores"

const hideLastRowBorder = "[&_tr:last-child]:border-b-0"

function MobileRtpDetails() {
  return (
    <Accordion type="single" collapsible className="2xl:hidden">
      <AccordionItem value="roadmap-details">
        <AccordionTrigger className="text-lg">roadmap details</AccordionTrigger>
        <AccordionContent className={hideLastRowBorder}>
          <RoadmapDetailsContent />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="rtp-cohort-rules">
        <AccordionTrigger className="text-lg">
          RTP cohort rules
        </AccordionTrigger>
        <AccordionContent className={hideLastRowBorder}>
          <RtpCohortRulesContent />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="rtp-cohort-scores" className="border-b-0">
        <AccordionTrigger className="text-lg">
          RTP cohort scores
        </AccordionTrigger>
        <AccordionContent>
          <RtpCohortScoresContent />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function DesktopRtpDetails() {
  return (
    <div className="hidden gap-4 2xl:grid 2xl:grid-cols-3">
      <RoadmapDetails />
      <RtpCohortRules />
      <RtpCohortScores />
    </div>
  )
}

export function RtpDetailsSection() {
  return (
    <>
      <MobileRtpDetails />
      <DesktopRtpDetails />
    </>
  )
}
