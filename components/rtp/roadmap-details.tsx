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

type PhaseStatus = "complete" | "current" | "future"

interface PhaseDetail {
  id: string
  label: string
  name: string
  status: PhaseStatus
  description: string
}

const phaseDetails: PhaseDetail[] = [
  {
    id: "0.1",
    label: "p0.1",
    name: "performance sprint",
    status: "complete",
    description: "achieved real-time proving",
  },
  {
    id: "0.2",
    label: "p0.2",
    name: "security sprint",
    status: "current",
    description: "M1 + M2 + M3 milestones",
  },
  {
    id: "1",
    label: "p1",
    name: "delayed proving",
    status: "future",
    description: "proofs accepted with delay",
  },
  {
    id: "2",
    label: "p2",
    name: "mandatory proving",
    status: "future",
    description: "proofs required for validity",
  },
  {
    id: "3",
    label: "p3",
    name: "enshrined proving",
    status: "future",
    description: "protocol-native proving",
  },
]

const statusColorMap: Record<PhaseStatus, string> = {
  complete: "text-info",
  current: "text-primary",
  future: "text-muted-foreground",
}

export function RoadmapDetailsContent() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 text-xs">phase</TableHead>
          <TableHead className="h-8 text-xs">status</TableHead>
          <TableHead className="h-8 text-xs">description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {phaseDetails.map((phase) => (
          <TableRow key={phase.id}>
            <TableCell className="py-2.5 text-muted-foreground">
              <div className="text-xs">
                {phase.label} :: {phase.name}
              </div>
            </TableCell>
            <TableCell className="py-2.5">
              <span
                className={cn(
                  "text-xs font-medium",
                  statusColorMap[phase.status]
                )}
              >
                {phase.status}
              </span>
            </TableCell>
            <TableCell className="py-2.5 text-xs text-muted-foreground">
              {phase.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function RoadmapDetails() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-lg">roadmap details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col [&>div]:flex-1 [&_table]:h-full">
        <RoadmapDetailsContent />
      </CardContent>
    </Card>
  )
}
