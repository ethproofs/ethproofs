import type { Metadata } from "next"
import Image from "next/image"

import EthProofsLogo from "@/components/svgs/eth-proofs-logo.svg"

import { cn } from "@/lib/utils"

import { getMetadata } from "@/lib/metadata"
import HeroDark from "@/public/images/hero-background.png"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20">
      <div
        className="absolute inset-0 -z-10 h-[26rem] md:max-xl:h-[22rem]"
        style={{ mask: "linear-gradient(180deg, white 80%, transparent)" }}
      >
        <Image
          src={HeroDark}
          style={{
            mask: "radial-gradient(circle, white 60%, transparent 90%)",
            objectPosition: "50% 30%", // Position around checkmark in image
          }}
          className={cn(
            "mx-auto h-full w-full max-w-screen-2xl object-cover",
            "opacity-80 contrast-[110%] hue-rotate-180 invert", // Light mode filters
            "dark:opacity-100 dark:contrast-100 dark:hue-rotate-0 dark:invert-0" // Dark mode filter resets
          )}
          alt=""
        />
      </div>
      <div className="mt-56 flex w-full flex-col items-center justify-between gap-4 p-3 md:mt-44 xl:mt-64">
        <h1 className="w-full text-center font-mono font-semibold">
          SNARKifying <span className="text-primary">Ethereum</span>
        </h1>
        <span className="my-2 text-xl">
          <span className="font-mono font-bold">soon™️</span> with
        </span>
        <div className="max-w-40 md:max-w-60 lg:max-w-80">
          <EthProofsLogo
            alt="EthProofs logo"
            className="size-full object-contain"
          />
        </div>
      </div>
    </div>
  )
}
