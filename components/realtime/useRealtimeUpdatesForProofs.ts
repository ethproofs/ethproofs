import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { createClient } from "@/utils/supabase/client"

// Subscribe to real-time updates for proofs and invalidate cache
// Uses the same pattern as the blocks page which is proven to work
const useRealtimeUpdatesForProofs = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const proofsChannel = supabase
      .channel("proofs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proofs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proofs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
        }
      )
      .subscribe()

    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["proofs-by-block"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(proofsChannel)
      supabase.removeChannel(blocksChannel)
    }
  }, [queryClient])
}

export default useRealtimeUpdatesForProofs
