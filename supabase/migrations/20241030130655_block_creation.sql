alter table "public"."blocks" add column "total_fees" bigint not null;

alter table "public"."blocks" alter column "transaction_count" set data type smallint using "transaction_count"::smallint;

alter table "public"."blocks" alter column "timestamp" set data type timestamp with time zone using "timestamp"::timestamp with time zone;

-- Add hash column to blocks table
alter table "public"."blocks" add column "hash" text not null;

-- remove old policy
drop policy "Enable insert for authenticated users only" on "public"."blocks";

-- add api key check for block creation
create policy "Enable insert for users with an api key"
on "public"."blocks"
as permissive
for insert
to public
with check (is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{all,write}'::key_mode[]));
