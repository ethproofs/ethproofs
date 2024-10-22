import Image from "next/image"
import HeroDark from "@/assets/hero-background-dark.png"
import HeroLight from "@/assets/hero-background-light.png"

export default async function Index() {
  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20">
      <Image
        src={HeroDark}
        className="absolute inset-0 -z-10 hidden dark:block"
        alt=""
      />
      <Image
        src={HeroLight}
        className="absolute inset-0 -z-10 dark:hidden"
        alt=""
      />
      <div className="mt-48 flex w-full flex-col items-center justify-between gap-4 p-3">
        <h1 className="w-full text-center font-mono font-semibold">
          Building fully SNARKed <span className="text-primary">Ethereum</span>
        </h1>
        <p className="max-w-2xl text-center text-lg">
          This is a proof of concept that ZK proves 1-of-N blocks. Eventually,
          it will enable full ZK light clients on any smartphone.
        </p>
      </div>
    </div>
  )
}
