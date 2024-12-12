import Image from "next/image"

import { cn } from "@/lib/utils"

import { getMetadata } from "@/lib/metadata"
import HeroDark from "@/public/images/learn-hero-background.png"

export const metadata = getMetadata({ title: "Learn" })

export default function LearnPage() {
  return (
    <div className="space-y-16">
      <div
        className="absolute inset-0 -z-10 h-[28rem] md:max-xl:h-96"
        style={{ mask: "linear-gradient(180deg, white 80%, transparent)" }}
      >
        <Image
          src={HeroDark}
          style={{
            mask: "radial-gradient(circle, white 60%, transparent 90%)",
            objectPosition: "50% 40%", // Position center of boxes
          }}
          className={cn(
            "mx-auto h-full w-full max-w-screen-2xl object-cover",
            "opacity-80 contrast-[110%] hue-rotate-180 invert", // Light mode filters
            "dark:opacity-100 dark:contrast-100 dark:hue-rotate-0 dark:invert-0" // Dark mode filter resets
          )}
          alt=""
        />
      </div>
      <div className="!mt-48 flex w-full flex-col items-center justify-between gap-4 p-3 md:mt-44 xl:!mt-56">
        <h1 className="w-full text-center font-mono font-semibold">
          Learn <span className="text-primary">&</span> resources
        </h1>
        <p className="max-w-2xl text-center text-lg">
          How zkEVM Transforms Smart Contracts with Zero-Knowledge Proofs
        </p>
      </div>

      <section className="space-y-16 md:mt-16 lg:mt-32 xl:mt-48">
        <div>
          <h1 className="text-4xl md:text-5xl">
            Learn about SNARKifying Ethereum
          </h1>
          <div className="h-px w-full bg-gradient-to-r from-primary"></div>
        </div>
        <div className="max-w-screen-lg">
          <p>
            This is proof of concept that should improve over time, eventually
            proving all Ethereum blocks with reasonable costs and latency.
          </p>
          <p>
            Proofs validate each Ethereum block, like a stamp of authenticity.
            This unlocks faster, more secure transactions, ensuring both
            efficiency and privacy, paving the way for a stronger Ethereum
            network. Its a foundation for a new class of applications and
            clients and acts as a major step towards a fully enshrined Ethereum.
          </p>
          <p>Eventually, this project can support multiple proof systems.</p>
        </div>
      </section>

      <section className="max-w-screen-lg space-y-6">
        <h2 className="text-2xl md:text-3xl">
          Potential benefits and use cases
        </h2>
        <ol className="space-y-6">
          <li>
            <strong>
              Enabling full ZK light clients of Ethereum to run on low powered
              devices (eg. smartphones).
            </strong>{" "}
            Syncing with the network can be done via a single ZK proof
            verification (once we combine Zeth ZK proofs with Sync Committee ZK
            proofs).
          </li>
          <li>
            <strong>Reduce the time and resources</strong> necessary for a new
            node or wallet to participate in the Ethereum network.
          </li>
          <li>
            <strong>Validate any current or historic Ethereum state</strong>{" "}
            with a single proof.
          </li>
          <li>
            <strong>
              Lay the groundwork for multi-client & multi-proof ZK proofs of
              Ethereum.
            </strong>
          </li>
          <li>
            <strong>Start tests of Ethereum enshrinement.</strong> These proofs
            will provide a large corpus of data for further research into
            performance improvements, gas/proving fee schedules, and more for
            the larger ZK community.
          </li>
          <li>
            <strong>Empower the Ethereum Ecosystem</strong> to take this
            powerful new ZK technology
          </li>
        </ol>
      </section>
      <section className="max-w-screen-lg space-y-6">
        <h2 className="text-2xl md:text-3xl">SNARKs</h2>
        <p>
          SNARK stands for{" "}
          <strong>Succinct Non-interactive ARgument of Knowledge</strong>. It is
          a cryptographic proof that allows one party to demonstrate to another
          party that they know a particular piece of information without
          revealing the information itself.
        </p>
        <p>Key features of SNARKs:</p>
        <ol className="space-y-6">
          <li>
            <strong>Succinct</strong>: The proofs are very short and can be
            verified quickly, even if the original computation is complex.
          </li>
          <li>
            <strong>Non-interactive</strong>: The proof is provided in a single
            communication, with no need for multiple rounds of exchange between
            the prover and verifier.
          </li>
          <li>
            <strong>Argument of Knowledge</strong>: The prover demonstrates that
            they actually possess knowledge of the solution, not just that a
            solution exists.
          </li>
        </ol>

        <p>
          In blockchain and Ethereum, SNARKs can be used to verify transactions
          or computations off-chain, improving scalability and privacy by
          reducing the amount of data that needs to be processed on-chain.
        </p>
      </section>
    </div>
  )
}
