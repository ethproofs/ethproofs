import { createClient } from "@/utils/supabase/server"
import ProofsPage from "./proofs-page"

export default async function Proofs() {
  const supabase = createClient()
  const { data: blocks } = await supabase.from("blocks").select(`
      *,
      proofs:proofs(
        id:proof_id
      )
    `)
  const { data: proofs } = await supabase.from("proofs").select()

  return <ProofsPage blocks={blocks || []} proofs={proofs || []} />
}
