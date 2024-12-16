create or replace view public.proof_sizes with (security_invoker=on) as
  select
    proof_id,
    pg_column_size(proof) as byte_size
  from
    proofs;
