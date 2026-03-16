import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { cn } from "@/lib/utils"

import {
  RTP_LIVENESS_SCORE_THRESHOLD,
  RTP_PERFORMANCE_SCORE_THRESHOLD,
} from "@/lib/constants"

interface CohortScore {
  name: string
  abbreviation: string
  formula: string
  target: string
  isMinimize: boolean
}

const cohortScores: CohortScore[] = [
  {
    name: "performance score",
    abbreviation: "PS",
    formula: "(sub-10s proofs / total blocks) x 100",
    target: `>${RTP_PERFORMANCE_SCORE_THRESHOLD}%`,
    isMinimize: false,
  },
  {
    name: "liveness score",
    abbreviation: "LS",
    formula: "(blocks proven / total blocks) x 100",
    target: `>${RTP_LIVENESS_SCORE_THRESHOLD}%`,
    isMinimize: false,
  },
  {
    name: "stunner rate",
    abbreviation: "SR",
    formula: "(>10s proofs / total blocks) x 100",
    target: "minimize",
    isMinimize: true,
  },
  {
    name: "paralyzer rate",
    abbreviation: "PR",
    formula: "(queued but not proved / total blocks) x 100",
    target: "minimize",
    isMinimize: true,
  },
]

export function RtpCohortScoresContent() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 text-xs">score</TableHead>
          <TableHead className="h-8 text-xs">formula</TableHead>
          <TableHead className="h-8 text-xs">target</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cohortScores.map((score) => (
          <TableRow key={score.abbreviation}>
            <TableCell className="py-2.5 text-xs text-muted-foreground">
              {score.name} ({score.abbreviation})
            </TableCell>
            <TableCell className="py-2.5 text-xs text-muted-foreground">
              {score.formula}
            </TableCell>
            <TableCell className="py-2.5">
              <span
                className={cn(
                  "text-xs font-semibold",
                  score.isMinimize ? "text-warning" : "text-primary"
                )}
              >
                {score.target}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function RtpCohortScores() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-lg">RTP cohort scores</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col [&>div]:flex-1 [&_table]:h-full">
        <RtpCohortScoresContent />
      </CardContent>
    </Card>
  )
}
