"use client"

import {
  RoadmapDetails,
  RoadmapDetailsContent,
} from "@/components/rtp/roadmap-details"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

import { OppCohortRules, OppCohortRulesContent } from "./opp-cohort-rules"
import { OppCohortScores, OppCohortScoresContent } from "./opp-cohort-scores"

const hideLastRowBorder = "[&_tr:last-child]:border-b-0"

function MobileOppDetails() {
  return (
    <Accordion type="single" collapsible className="2xl:hidden">
      <AccordionItem value="roadmap-details">
        <AccordionTrigger className="text-lg">roadmap details</AccordionTrigger>
        <AccordionContent className={hideLastRowBorder}>
          <RoadmapDetailsContent />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="opp-cohort-rules">
        <AccordionTrigger className="text-lg">
          1:10 cohort rules
        </AccordionTrigger>
        <AccordionContent className={hideLastRowBorder}>
          <OppCohortRulesContent />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="opp-cohort-scores" className="border-b-0">
        <AccordionTrigger className="text-lg">
          1:10 cohort scores
        </AccordionTrigger>
        <AccordionContent>
          <OppCohortScoresContent />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function DesktopOppDetails() {
  return (
    <Card className="hidden bg-muted/20 2xl:block">
      <Accordion type="single" collapsible className="px-6">
        <AccordionItem value="opp-details" className="border-b-0">
          <AccordionTrigger className="text-lg">
            1:10 cohort requirements
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4">
              <RoadmapDetails />
              <OppCohortRules />
              <OppCohortScores />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}

export function OppDetailsSection() {
  return (
    <>
      <MobileOppDetails />
      <DesktopOppDetails />
    </>
  )
}
