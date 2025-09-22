import type { Metadata } from "next"

import BasicTabs from "@/components/BasicTabs"
import SoftwareAccordion from "@/components/SoftwareAccordion"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "zkVMs" })

export default async function ZkvmsPage() {
  return (
    <>
      <h1 className="mb-24 mt-16 px-6 text-center text-3xl font-semibold md:mt-24 md:px-8">
        zkVMs
      </h1>

      <div className="mx-auto flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
        <section className="overflow-x-auto">
          <BasicTabs
            defaultTab="left"
            contentLeft={<SoftwareAccordion type="active" />}
            contentLeftTitle="active"
            contentRight={<SoftwareAccordion type="inactive" />}
            contentRightTitle="coming soon"
          />
        </section>
      </div>
    </>
  )
}
