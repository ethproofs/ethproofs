import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { createClient } from "@/utils/supabase/client"

const useRealtimeBlockProofs = () => {
  const queryClient = useQueryClient()
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Debounced invalidate to prevent cascade loops
    const debouncedInvalidate = () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current)
      }
      refetchTimeoutRef.current = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["blocks"],
        })
      }, 300) // Wait 300ms to batch multiple events
    }

    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        () => debouncedInvalidate()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "blocks" },
        () => debouncedInvalidate()
      )
      .subscribe((status) => {
        console.log("[Realtime] Blocks channel status:", status)
      })

    const proofsChannel = supabase
      .channel("proofs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proofs" },
        () => debouncedInvalidate()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proofs" },
        () => debouncedInvalidate()
      )
      .subscribe((status) => {
        console.log("[Realtime] Proofs channel status:", status)
      })

    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current)
      }
      supabase.removeChannel(blocksChannel)
      supabase.removeChannel(proofsChannel)
    }
  }, [queryClient])
}

export default useRealtimeBlockProofs
