import { createClient } from '@/utils/supabase/server';

export default async function Proofs() {
  const supabase = createClient();
  const { data: proofs } = await supabase.from("proofs").select();

  return <pre>{JSON.stringify(proofs, null, 2)}</pre>
}