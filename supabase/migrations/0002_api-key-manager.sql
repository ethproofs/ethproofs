create role api_key_manager;

grant api_key_manager to authenticator;
grant anon to api_key_manager;

create policy "Allow user creation for api_key_manager"
on auth.users
as restrictive
for insert
to api_key_manager
with check (true);

create policy "Allow API key creation for api_key_manager"
on public.api_auth_tokens
as restrictive
for insert
to api_key_manager
with check (exists (
    select 1 from auth.users where users.id = api_auth_tokens.team_id
));