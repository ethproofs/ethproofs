import matter from "gray-matter"
import Image from "next/image"

import { MarkdownProvider } from "@/components/Markdown/Provider"

import { cn } from "@/lib/utils"

import { LEARN_RESOURCES_MD_URL, SITE_NAME } from "@/lib/constants"

import { getMetadata } from "@/lib/metadata"
import HeroDark from "@/public/images/learn-hero-background.png"

export const metadata = getMetadata({ title: "Learn" })

export default async function LearnPage() {
  const response = await fetch(LEARN_RESOURCES_MD_URL)
  const markdown = response.ok ? await response.text() : ""

  // Extract resources and tutorials sections from fetched markdown
  const resourcesMatch = markdown.match(/(?<=## resources)([\s\S]*?)\n#{1,2}\s/)
  const tutorialsMatch = markdown.match(/(?<=## tutorials)([\s\S]*?)\n#{1,2}\s/)
  const resources = resourcesMatch ? matter(resourcesMatch[0]).content : ""
  const tutorials = tutorialsMatch ? matter(tutorialsMatch[0]).content : ""

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
          priority
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

      <section className="mx-auto max-w-screen-md space-y-16 md:mt-16 lg:mt-32 xl:mt-48">
        <div>
          <h2 className="text-4xl md:text-5xl">Overview</h2>
          <div className="h-px w-full bg-gradient-to-r from-primary"></div>
        </div>
        <div className="space-y-16">
          <div className="space-y-8">
            <h3 className="text-3xl">What are zkEVM?</h3>
            <p>
              zkEVM, or Zero-Knowledge Ethereum Virtual Machine, is an advanced
              version of the Ethereum Virtual Machine (EVM) that utilizes
              zero-knowledge proofs to enhance privacy and scalability in
              executing smart contracts. It allows developers to run
              computations off-chain while submitting only proofs of their
              validity to the Ethereum mainnet, ensuring that sensitive data
              remains confidential.
            </p>
            <p>
              By integrating zero-knowledge technology, zkEVM enables verifiable
              transactions without exposing underlying information, making it a
              crucial component of Layer 2 scaling solutions like zk-rollups.
              This innovation is pivotal for improving Ethereum’s throughput and
              accommodating a broader range of decentralized applications
              (dApps) while maintaining security and privacy.
            </p>
          </div>
          <div className="space-y-8">
            <h3 className="text-3xl">What are the proofs?</h3>
            <p>
              Proofs validate each Ethereum block like a stamp of authenticity.
              This unlocks faster, more secure transactions, ensuring efficiency
              and privacy and paving the way for a stronger Ethereum network.
              Proofs are a foundation for a new class of applications and
              clients and act as a major step towards a fully enshrined
              Ethereum.
            </p>
          </div>
          <div className="space-y-8">
            <h3 className="text-3xl">What are SNARKs?</h3>
            <p>
              SNARK stands for Succinct Non-interactive ARgument of Knowledge.
              It is a cryptographic proof that allows one party to demonstrate
              to another party that they know a particular piece of information
              without revealing the information itself.
            </p>
            <div className="space-y-4">
              <p>Key features of SNARKs:</p>
              <ul>
                <li>
                  Succinct: The proofs are very short and can be verified
                  quickly, even if the original computation is complex.
                </li>
                <li>
                  Non-interactive: The proof is provided in a single
                  communication, with no need for multiple rounds of exchange
                  between the prover and verifier.
                </li>
                <li>
                  Argument of Knowledge: The prover demonstrates that they
                  actually possess knowledge of the solution, not just that a
                  solution exists.
                </li>
              </ul>
            </div>
            <p>
              In blockchain and Ethereum, SNARKs can be used to verify
              transactions or computations off-chain, improving scalability and
              privacy by reducing the amount of data that needs to be processed
              on-chain.
            </p>
          </div>
          <div className="space-y-8">
            <h3 className="text-3xl">Potential benefits and use cases</h3>
            <ul>
              <li>
                Enabling full ZK light clients of Ethereum to run on low powered
                devices (eg. smartphones). Syncing with the network can be done
                via a single ZK proof verification (once we combine Zeth ZK
                proofs with Sync Committee ZK proofs).
              </li>
              <li>
                Reduce the time and resources necessary for a new node or wallet
                to participate in the Ethereum network.
              </li>
              <li>
                Validate any current or historic Ethereum state with a single
                proof.
              </li>
              <li>
                Lay the groundwork for multi-client & multi-proof ZK proofs of
                Ethereum.
              </li>
              <li>
                Start tests of Ethereum enshrinement. These proofs will provide
                a large corpus of data for further research into performance
                improvements, gas/proving fee schedules, and more for the larger
                ZK community.
              </li>
              <li>
                Empower the Ethereum Ecosystem to take this powerful new ZK
                technology
              </li>
            </ul>
          </div>
          {resources && (
            <div className="space-y-8">
              <h3 className="text-3xl">More resources</h3>
              <MarkdownProvider>{resources}</MarkdownProvider>
            </div>
          )}
          {tutorials && (
            <div className="space-y-8">
              <h3 className="text-3xl">Tutorials</h3>
              <MarkdownProvider>{tutorials}</MarkdownProvider>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-screen-md space-y-16 md:mt-16 lg:mt-32 xl:mt-48">
        <div>
          <h2 className="text-4xl md:text-5xl">{SITE_NAME}</h2>
          <div className="h-px w-full bg-gradient-to-r from-primary"></div>
        </div>
        <div className="space-y-16">
          <div className="space-y-8">
            <h3 className="text-3xl">What is {SITE_NAME}?</h3>
            <p>
              {SITE_NAME} is a block explorer for Layer 1 zkEVM. It aggregates
              data from various proving vendors to provide a comprehensive
              overview of proven blocks, including key metadata such as cost,
              latency, and proofing time.{" "}
            </p>
            <p>
              Users can compare proofs by block, download them, and explore
              vendor-specific metadata to better understand the proving process.
            </p>
            <p>
              The aim is to establish a public good that evolves into the
              standard for zkEVM block exploration, ultimately expanding to
              encompass all Ethereum blocks while maintaining reasonable costs
              and latency. This project may also support multiple-proof systems
              in the future.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
