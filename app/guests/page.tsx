import type { Metadata } from "next"

import { GuestProgramsTable } from "@/components/guest-programs-table/guest-programs-table"

import { getGuestProgramsWithUsage } from "@/lib/api/guest-programs"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "guest programs" })

export default async function GuestsPage() {
  const guestPrograms = await getGuestProgramsWithUsage()

  const totalActiveClusters = guestPrograms.reduce(
    (sum, program) => sum + program.activeClusters,
    0
  )

  const sortedPrograms = guestPrograms.sort((a, b) => {
    const clusterDiff = b.activeClusters - a.activeClusters
    if (clusterDiff !== 0) return clusterDiff
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
      <section>
        <span className="text-2xl">guests</span>
        <GuestProgramsTable
          className="mt-4"
          guestPrograms={sortedPrograms}
          totalActiveClusters={totalActiveClusters}
        />
      </section>
    </div>
  )
}
