import { createClient } from "@/utils/supabase/server"

import { DataTable } from "@/components/ui/data-table"
import { type Proof, columns } from "./columns"

async function getData(): Promise<Proof[]> {
  const supabase = createClient()
  const { data } = await supabase.from("proofs").select()
  return data || []
}

export default async function ProofsPage() {
  const data = await getData()
  return <DataTable columns={columns} data={data} />
}
