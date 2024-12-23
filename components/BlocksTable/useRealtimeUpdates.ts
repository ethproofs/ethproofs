import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { createClient } from "@/utils/supabase/client"

// This hook subscribes to real-time updates for blocks and proofs tables
// and invalidates the blocks query cache when changes occur
const useRealtimeUpdates = () => {
  const queryClient = useQueryClient()

  const supabase = createClient()

  useEffect(() => {
    const blocksChannel = supabase
      .channel("blocks")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blocks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocks"] })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "blocks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocks"] })
        }
      )
      .subscribe()

    const proofsChannel = supabase
      .channel("proofs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "proofs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocks"] })
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proofs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["blocks"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(blocksChannel)
      supabase.removeChannel(proofsChannel)
    }
  }, [queryClient, supabase])
}

export default useRealtimeUpdates
