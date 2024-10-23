import { createClient } from "@/utils/supabase/server"

import { DataTable } from "@/components/ui/data-table"
import { type Block, columns } from "./columns"

async function getData(): Promise<Block[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("blocks")
    .select(`*,proofs:proofs(id:proof_id)`)
  return data || []
}

export default async function BlocksPage() {
  const data = await getData()
  return <DataTable columns={columns} data={data} />
}
