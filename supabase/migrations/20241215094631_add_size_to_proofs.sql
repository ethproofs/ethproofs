alter table public.proofs add column size bigint;

-- props: {"title": "create trigger function to update size", "runQuery": "false", "isChart": "false"}
create or replace function update_size()
returns trigger as $$
begin
  if new.proof is not null then
    new.size := octet_length(new.proof);
  else
    new.size := null;
  end if;
  return new;
end;
$$ language plpgsql;

-- props: {"title": "create trigger for updating size", "runQuery": "false", "isChart": "false"}
create trigger set_size
before insert or update on public.proofs
for each row execute function update_size();