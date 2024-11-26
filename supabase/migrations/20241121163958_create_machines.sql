create policy "Enable insert for users with an api key"
on "public"."prover_machines"
as permissive
for insert
to public
with check (is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,write}'::key_mode[]));
