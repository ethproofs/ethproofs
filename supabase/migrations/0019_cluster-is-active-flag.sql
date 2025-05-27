ALTER TABLE "clusters" ADD COLUMN "is_active" boolean DEFAULT false NOT NULL;

-- Create the update function
create or replace function update_cluster_active_status()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
    update clusters c
    set is_active = exists (
    select 1
    from proofs p
    join cluster_versions cv on p.cluster_version_id = cv.id
    where cv.cluster_id = c.id
    and p.proof_status = 'proved'
    and p.proved_timestamp >= now() - interval '7 days'
    );
end;
$$;