import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { createClient } from "@/utils/supabase/client"

// Subscribe to real-time updates for proofs and blocks, refetching blocks query on changes
const useRealtimeProofs = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const proofsChannel = supabase
      .channel("proofs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proofs" },
        () => {
          console.log("[Realtime] Proof INSERT - refetching blocks", new Date().toISOString())
          queryClient.refetchQueries({ queryKey: ["blocks"] })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proofs" },
        () => {
          console.log("[Realtime] Proof UPDATE - refetching blocks", new Date().toISOString())
          queryClient.refetchQueries({ queryKey: ["blocks"] })
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] Proofs channel status:", status)
      })

    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        () => {
          console.log("[Realtime] Block INSERT - refetching blocks", new Date().toISOString())
          queryClient.refetchQueries({ queryKey: ["blocks"] })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "blocks" },
        () => {
          console.log("[Realtime] Block UPDATE - refetching blocks", new Date().toISOString())
          queryClient.refetchQueries({ queryKey: ["blocks"] })
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] Blocks channel status:", status)
      })

    return () => {
      supabase.removeChannel(proofsChannel)
      supabase.removeChannel(blocksChannel)
    }
  }, [queryClient])
}

export default useRealtimeProofs
