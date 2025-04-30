import { Box } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import ClusterAccordion from "@/components/ClusterAccordion"
import SoftwareDetails from "@/components/SoftwareDetails"
import GitHub from "@/components/svgs/github.svg"

import { cn } from "@/lib/utils"

import { demoClusterDetails } from "@/lib/dummy-data"
import { getMetadata } from "@/lib/metadata"

type ZkvmDetailsPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ZkvmDetailsPageProps): Promise<Metadata> {
  const { slug } = await params

  // TODO: Confirm slug is human readable
  return getMetadata({
    title: `zmVM ${slug}`,
  })
}

export default async function ZkvmDetailsPage({
  params,
}: ZkvmDetailsPageProps) {
  const slug = (await params).slug

  const zkvm = decodeURIComponent(slug) // TODO: Confirm/fetch zkvm name from slug

  if (!zkvm) throw new Error()

  // TODO: Fetch details for zkVM

  return (
    <>
      <div className="absolute top-16 w-full space-y-4 px-6 text-center font-mono sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <h1
          className="text-3xl font-semibold"
          style={{
            textShadow: `
              0 0 3rem hsla(var(--background-modal)),
              0 0 2rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal))`,
          }}
        >
          {zkvm}
        </h1>

        <div className="flex items-center justify-center gap-3">
          <span className="inline-block font-mono italic text-body-secondary">
            by
          </span>
          <Link
            href="/prover/succinct#TODO-prover-id"
            className="inline-block rounded p-1 hover:bg-primary/10"
          >
            <Image
              src="https://ndjfbkojyebmdbckigbe.supabase.co/storage/v1/object/public/public-assets/succinct-logo-new.svg"
              alt="Succinct logo"
              height={16}
              width={16}
              style={{ height: "1.5rem", width: "auto" }}
              className="dark:invert"
            />
            <span className="sr-only">Succinct</span>
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "mb-20 grid grid-cols-1 gap-y-8 max-sm:gap-y-4 sm:grid-cols-2 lg:grid-cols-4",
          "w-fit md:w-[calc(100vw_-_var(--sidebar-width))]",
          "mx-auto gap-x-20 md:px-24"
        )}
      >
        <div className="row-span-2 grid grid-cols-subgrid place-items-center gap-y-1 text-nowrap">
          <div className="text-body-secondary">latest version</div>
          <div className="">4.17</div>
        </div>
        <div className="row-span-2 grid grid-cols-subgrid place-items-center gap-y-1 text-nowrap">
          <div className="text-body-secondary">release date</div>
          <div className="uppercase">
            {new Date(Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="row-span-2 grid grid-cols-subgrid place-items-center gap-y-1 text-nowrap">
          <div className="text-body-secondary">ISA</div>
          <div className="uppercase">RISC-V</div>
        </div>
        <div className="row-span-2 grid grid-cols-subgrid place-items-center gap-y-1 text-nowrap">
          <div className="text-body-secondary">official repository</div>
          <div className="flex items-center gap-2">
            <GitHub className="text-2xl" /> succinctlabs/SP1
          </div>
        </div>
      </div>

      <div
        className={cn(
          "bg-gradient-to-b from-background to-background-active",
          "w-fit md:w-[calc(100vw_-_var(--sidebar-width))]",
          "mx-auto gap-x-20 md:px-24"
        )}
      >
        <h2 className="sr-only">zkVM software details</h2>
        <SoftwareDetails />
      </div>

      {/* // TODO: Fill in with fetched data */}
      <div className="mx-6 mt-40 max-w-full gap-x-20 md:mx-auto md:w-[calc(100vw_-_var(--sidebar-width))] md:px-[5vw]">
        <h2 className="flex items-center gap-2 font-mono text-lg font-normal text-primary">
          <Box className="size-11 text-primary" strokeWidth="1" />
          active clusters using SP1: 5 / 12
        </h2>
        <div className="-me-6 overflow-x-auto pe-6">
          <ClusterAccordion clusters={demoClusterDetails} />
        </div>
      </div>
    </>
  )
}
