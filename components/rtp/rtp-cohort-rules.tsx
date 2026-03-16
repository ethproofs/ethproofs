import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// import {
//   RTP_LIVENESS_SCORE_THRESHOLD,
//   RTP_PERFORMANCE_SCORE_THRESHOLD,
// } from "@/lib/constants"
// import Link from "../ui/link"

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
        <span className="text-primary">1:1 multi-GPU prover</span> &mdash;
        submitting a proof for every L1 block
      </>
    ),
  },
  {
    id: "03",
    description: (
      <>
        prover must be <span className="text-primary">reproducible</span>{" "}
        &mdash; preferably open-source
      </>
    ),
  },
  {
    id: "04",
    description: (
      <>
        verifier must be <span className="text-primary">open-source</span> and
        integrated into Ethproofs in-browser verification
      </>
    ),
  },
  // {
  //   id: "03",
  //   description: (
  //     <>
  //       prover must maintain a{" "}
  //       <span className="text-primary">
  //         performance score of &ge;{RTP_PERFORMANCE_SCORE_THRESHOLD}%
  //       </span>{" "}
  //       or higher during the previous 7-day window
  //     </>
  //   ),
  // },
  // {
  //   id: "04",
  //   description: (
  //     <>
  //       prover must maintain a{" "}
  //       <span className="text-primary">
  //         liveness score of &ge;{RTP_LIVENESS_SCORE_THRESHOLD}%
  //       </span>{" "}
  //       or higher during the previous 7-day window
  //     </>
  //   ),
  // },
]

export function RtpCohortRulesContent() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 text-xs" colSpan={2}>
            <span className="flex items-center gap-1.5">
              baseline requirements
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
      {/* <TableFooter className="border-t-0 bg-transparent">
        <TableRow>
          <TableCell className="h-8 text-xs" colSpan={2}>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              real-time proving (RTP) definition
              <Link
                href="https://blog.ethereum.org/2025/07/10/realtime-proving"
                target="_blank"
                rel="noopener noreferrer"
              ></Link>
            </span>
          </TableCell>
        </TableRow>
      </TableFooter> */}
    </Table>
  )
}

export function RtpCohortRules() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">RTP cohort eligibility</CardTitle>
      </CardHeader>
      <CardContent>
        <RtpCohortRulesContent />
      </CardContent>
    </Card>
  )
}
