import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { SITE_NAME } from "@/lib/constants"

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
          <div className="space-y-8">
            <h3 className="text-3xl">More resources</h3>
            <ul>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.lita.foundation/blog/zero-knowledge-paradigm-zkvm"
                >
                  a zero-knowledge paradigm series
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=vVgHL5vpJxY&t=33s"
                >
                  cairo – a turing-complete stark-friendly cpu architecture -
                  shahar papini
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://youtube.com/playlist?list=PLjQ9HCQMu_8xjOEM_vh5p26ODtr-mmGxO&si=Uega8IMg_J8kNaa8"
                >
                  lasso + jolt playlist
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.mikkoikola.com/blog/2023/12/11/new-paradigm-in-ethereum-l2-scaling-multi-proving-and-zk-vms"
                >
                  new paradigm in ethereum l2 scaling: multi-proving and zk-vms
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=UtzFOwQp8n4"
                >
                  the nexus v1.0 zkvm - daniel marin (nexus)
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://a16zcrypto.com/posts/article/understanding-jolt-clarifications-and-reflections/"
                >
                  understanding jolt: clarifications and reflections
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=GRFPGJW0hic"
                >
                  zk whiteboard sessions – module seven: zero knowledge virtual
                  machines (zkvm) with grjte
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=tWJZX-WmbeY&t=325s"
                >
                  zk10: analysis of zkvm designs - wei dai & terry chung
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=HDH2KXRAxAc"
                >
                  zk11: o1vm: building a real-world zkvm for mips - danny
                  willems
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=kzSYNFh4uQ0&list=PLothk45x3HC9Oz4f3e9-OoYUEytfHWCl5"
                >
                  zk12: memory checking in ivc-based zkvm - jens groth
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=81UAaiIgIYA&t=803s"
                >
                  zk7: miden vm: a stark-friendly vm for blockchains - bobbin
                  threadbare – polygon
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://taiko.mirror.xyz/e_5GeGGFJIrOxqvXOfzY6HmWcRjCjRyG0NQF1zbNpNQ"
                >
                  zeroing into zkvm
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=aobrJ-zTcAU"
                >
                  zkvm design walkthrough with max and daniel
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://github.com/CertiKProject/zkwasm-fv"
                >
                  Verification of zkWasm in Coq
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=R07ina4k7hg"
                >
                  zk11: polynomial acceleration for stark vms
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=11DIflEwx50"
                >
                  what does risc v have to do with risc zero&apos;s zkvm
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=RtGk6967PC4"
                >
                  risc zero architecture presentation @ stanford
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=h1qWnf-M5lo"
                >
                  continuations: scaling in zkvm
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://a16zcrypto.com/posts/article/getting-bugs-out-of-snarks/"
                >
                  Getting the bugs out of SNARKs: The road ahead
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://www.youtube.com/watch?v=zD45V6GAD00"
                >
                  ~tacryt-socryp on Zorp, the Nock zkVM | Reassembly23
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-8">
            <h3 className="text-3xl">Tutorials</h3>
            <ul>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://neptune.cash/learn/brainfuck-tutorial/"
                >
                  brainfuck tutorial
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://blog.lambdaclass.com/continuous-read-only-memory-constraints-an-implementation-using-lambdaworks/"
                >
                  continuous read only memory constraints an implementation
                  using lambdaworks
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://blog.lambdaclass.com/how-to-code-fri-from-scratch/"
                >
                  fri from scratch
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://dev.risczero.com/proof-system/stark-by-hand"
                >
                  stark by hand
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://aszepieniec.github.io/stark-brainfuck/"
                >
                  stark brainfuck
                </Link>
              </li>
              <li>
                <Link
                  className="text-primary hover:text-primary-light"
                  href="https://starkware.co/stark-101/"
                >
                  stark 101
                </Link>
              </li>
            </ul>
          </div>
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
