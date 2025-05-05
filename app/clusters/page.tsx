import type { Metadata } from "next"

// import ClusterTable from "@/components/ClusterTable"
// import MachineTabs from "@/components/MachineTabs"
// import { getClusters } from "@/lib/api/clusters"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  // const clusters = await getClusters()

  return (
    <>
      <div className="absolute top-0 h-40 w-full space-y-12 px-6 pt-24 text-center font-mono font-semibold md:px-8">
        <h1
          className="text-3xl"
          style={{
            textShadow: `
              0 0 3rem hsla(var(--background-modal)),
              0 0 2rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal))`,
          }}
        >
          clusters
        </h1>
      </div>
      {/* <div className="flex flex-1 flex-col items-center gap-20">
        <section className="w-full max-w-screen-xl scroll-m-20">
          <MachineTabs
            singleContent={<ClusterTable clusters={clusters} />}
            multiContent={<ClusterTable clusters={clusters} />}
          />
        </section>
      </div> */}
    </>
  )
}
