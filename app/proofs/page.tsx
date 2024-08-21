import { createClient } from "@/utils/supabase/server"
import ProofsPage from "./proofs-page"

export default async function Proofs() {
  const supabase = createClient()
  const { data: blocks } = await supabase.from("blocks").select(`
      *,
      proofs:proofs(*)
    `)

  return <ProofsPage blocks={blocks || []} />
}
