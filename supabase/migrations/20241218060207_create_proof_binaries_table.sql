create table public.proof_binaries (
  proof_id integer not null,
  proof_binary bytea not null,
  constraint proof_binaries_pkey primary key (proof_id),
  constraint proof_binaries_proof_id_fkey foreign key (proof_id) references public.proofs(proof_id) on delete cascade
) with (oids=false);

alter table public.proof_binaries owner to postgres;

insert into public.proof_binaries (proof_id, proof_binary)
select proof_id, proof
from public.proofs
where proof is not null;

create policy enable_insert_for_users_with_an_api_key on public.proof_binaries for insert with check (public.is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,write}'::public.key_mode[]));

create policy enable_read_access_for_all_users on public.proof_binaries for select using (true);

create policy enable_updates_for_users_with_an_api_key on public.proof_binaries for update using (public.is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,write}'::public.key_mode[]));

alter table public.proof_binaries enable row level security;

grant all on table public.proof_binaries to anon;
grant all on table public.proof_binaries to authenticated;
grant all on table public.proof_binaries to service_role;