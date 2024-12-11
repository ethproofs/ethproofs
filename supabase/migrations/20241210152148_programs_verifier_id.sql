create table "public"."programs" (
    "id" bigint generated by default as identity not null,
    "verifier_id" text not null,
    "created_at" timestamp with time zone not null default now()
);

alter table "public"."programs" enable row level security;

alter table "public"."proofs" add column "program_id" bigint;

CREATE UNIQUE INDEX programs_pkey ON public.programs USING btree (id);

CREATE UNIQUE INDEX programs_verifier_id_key ON public.programs USING btree (verifier_id);

alter table "public"."programs" add constraint "programs_pkey" PRIMARY KEY using index "programs_pkey";

alter table "public"."programs" add constraint "programs_verifier_id_key" UNIQUE using index "programs_verifier_id_key";

alter table "public"."proofs" add constraint "proofs_program_id_fkey" FOREIGN KEY (program_id) REFERENCES programs(id) not valid;

alter table "public"."proofs" validate constraint "proofs_program_id_fkey";

grant delete on table "public"."programs" to "anon";

grant insert on table "public"."programs" to "anon";

grant references on table "public"."programs" to "anon";

grant select on table "public"."programs" to "anon";

grant trigger on table "public"."programs" to "anon";

grant truncate on table "public"."programs" to "anon";

grant update on table "public"."programs" to "anon";

grant delete on table "public"."programs" to "authenticated";

grant insert on table "public"."programs" to "authenticated";

grant references on table "public"."programs" to "authenticated";

grant select on table "public"."programs" to "authenticated";

grant trigger on table "public"."programs" to "authenticated";

grant truncate on table "public"."programs" to "authenticated";

grant update on table "public"."programs" to "authenticated";

grant delete on table "public"."programs" to "service_role";

grant insert on table "public"."programs" to "service_role";

grant references on table "public"."programs" to "service_role";

grant select on table "public"."programs" to "service_role";

grant trigger on table "public"."programs" to "service_role";

grant truncate on table "public"."programs" to "service_role";

grant update on table "public"."programs" to "service_role";

CREATE POLICY "Enable insert for users with an api key" ON "public"."programs" FOR INSERT WITH CHECK ("public"."is_allowed_apikey"((("current_setting"('request.headers'::"text", true))::"json" ->> 'ethkey'::"text"), '{all,write}'::"public"."key_mode"[]));

CREATE POLICY "Enable read access for all users" ON "public"."programs" FOR SELECT USING (true);