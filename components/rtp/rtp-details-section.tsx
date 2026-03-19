"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

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
    <Card className="hidden bg-muted/20 2xl:block">
      <Accordion type="single" collapsible className="px-6">
        <AccordionItem value="rtp-details" className="border-b-0">
          <AccordionTrigger className="text-lg">
            RTP cohort requirements
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4">
              <RoadmapDetails />
              <RtpCohortRules />
              <RtpCohortScores />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
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
