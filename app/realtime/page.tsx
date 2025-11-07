"use client"

import { RealtimeProofsDisplay } from "@/components/realtime/realtime-proofs-display"

export const dynamic = "force-dynamic"

export default function RealtimePage() {
  return (
    <div className="mx-auto mt-2 max-w-screen-xl space-y-4 px-6">
      <section className="w-full">
        <span className="text-2xl">realtime proofs</span>
        <div className="mt-4">
          <RealtimeProofsDisplay />
        </div>
      </section>
    </div>
  )
}
