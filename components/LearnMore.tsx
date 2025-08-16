import Link from "next/link"

import { Divider } from "./ui/divider"

export default function LearnMore() {
  return (
    <section>
      <h2 className="mt-32 text-5xl">Learn</h2>
      <Divider />
      <div className="my-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex w-full flex-col gap-8 rounded-4xl border-2 border-body/20 px-4 py-12">
          {/* TODO: Add card backgrounds */}
          <h3 className="max-w-72 text-3xl md:max-w-96">
            Why do we need to verify each block?
          </h3>
          <Link href="/learn" className="font-body">
            Learn more
          </Link>
        </div>

        <div className="flex w-full flex-col gap-8 rounded-4xl border-2 border-body/20 bg-background px-4 py-12">
          {/* TODO: Add card backgrounds */}
          <h3 className="max-w-72 text-3xl md:max-w-96">
            How do the proofs work?
          </h3>
          <Link href="/learn" className="font-body">
            Learn more
          </Link>
        </div>
      </div>
    </section>
  )
}
