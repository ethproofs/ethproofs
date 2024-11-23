alter table "public"."proofs" alter column "proof" drop not null;

create policy "Enable updates for users with an api key"
on "public"."proofs"
as permissive
for update
to public
using (is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,write}'::key_mode[]));
