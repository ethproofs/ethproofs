import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  OPP_LIVENESS_SCORE_THRESHOLD,
  OPP_PERFORMANCE_SCORE_THRESHOLD,
} from "@/lib/constants"

interface CohortRule {
  id: string
  description: React.ReactNode
}

const cohortRules: CohortRule[] = [
  {
    id: "01",
    description: (
      <>
        prover must be running a zkVM that has completed{" "}
        <span className="text-primary">security sprint milestone 1</span>{" "}
        &mdash; integrate with{" "}
        <a
          href="https://github.com/ethereum/soundcalc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary-light"
        >
          soundcalc
        </a>
      </>
    ),
  },
  {
    id: "02",
    description: (
      <>
        prover must be running a zkVM on a{" "}
        <span className="text-primary">1:10 multi-GPU on-prem prover</span>{" "}
        &mdash; submitting a proof for every 10th L1 block
      </>
    ),
  },
  {
    id: "03",
    description: (
      <>
        prover must maintain a{" "}
        <span className="text-primary">
          performance score of &ge;{OPP_PERFORMANCE_SCORE_THRESHOLD}%
        </span>{" "}
        or higher during the previous 7-day window
      </>
    ),
  },
  {
    id: "04",
    description: (
      <>
        prover must maintain a{" "}
        <span className="text-primary">
          liveness score of &ge;{OPP_LIVENESS_SCORE_THRESHOLD}%
        </span>{" "}
        or higher during the previous 7-day window
      </>
    ),
  },
]

export function OppCohortRulesContent() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 text-xs" colSpan={2}>
            <span className="flex items-center gap-1.5">
              baseline requirements to be eligible
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cohortRules.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell className="w-8 py-2.5 align-top text-muted-foreground">
              {rule.id}
            </TableCell>
            <TableCell className="py-2.5 text-xs leading-relaxed text-muted-foreground">
              {rule.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function OppCohortRules() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-lg">1:10 cohort rules</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col [&>div]:flex-1 [&_table]:h-full">
        <OppCohortRulesContent />
      </CardContent>
    </Card>
  )
}
