import BenchmarksList from "@/components/BenchmarksList/BenchmarksList"

import { getClustersByTeamId } from "@/lib/api/clusters"
import { getTeamBySlug } from "@/lib/api/teams"

export default async function BenchmarksPage() {
  const benchmarksTeam = await getTeamBySlug("ethproofs")
  if (!benchmarksTeam) return null
  const benchmarksClusters = await getClustersByTeamId(benchmarksTeam?.id)

  return (
    <>
      <div className="mb-24 mt-16 space-y-2 px-6 text-center md:mt-24 md:px-8">
        <h1 className="text-shadow font-mono text-3xl font-semibold">
          benchmarks
        </h1>
        <div className="mx-auto max-w-md pb-6 font-sans text-sm font-normal">
          <div>
            Ethproofs is currently in the process of gathering feedback on how
            to best benchmark zkVMs on Ethproofs. Results are being analyzed
            with teams and may be exposing potential issues with the zkVM, the
            guest program, or the Ethereum protocol itself.
          </div>
        </div>
        <aside className="flex items-center justify-center gap-2 rounded border border-level-worst bg-background-accent px-6 py-4 text-center text-level-worst">
          disclaimer: these benchmarks are still in development and should be
          carefully analyzed before drawing conclusions
        </aside>
      </div>
      <div className="mx-auto flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
        <section>
          <BenchmarksList clusters={benchmarksClusters} />
        </section>
      </div>
    </>
  )
}
