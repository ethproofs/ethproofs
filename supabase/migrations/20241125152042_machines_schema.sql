alter table "public"."proofs" drop constraint "proofs_prover_machine_id_fkey";

alter table "public"."prover_machines" drop constraint "prover_machines_pkey";

drop index if exists "public"."prover_machines_pkey";

alter table "public"."proofs" drop column "prover_machine_id";

alter table "public"."proofs" add column "machine_id" uuid not null;

alter table "public"."prover_machines" add column "id" uuid not null default gen_random_uuid();

alter table "public"."prover_machines" add column "machine_description" text;

alter table "public"."prover_machines" alter column "machine_id" drop identity;

alter table "public"."prover_machines" alter column "machine_id" drop not null;

alter table "public"."prover_machines" alter column "machine_id" set data type smallint using "machine_id"::smallint;

alter table "public"."prover_machines" alter column "user_id" set not null;

CREATE UNIQUE INDEX prover_machines_pkey ON public.prover_machines USING btree (id);

alter table "public"."prover_machines" add constraint "prover_machines_pkey" PRIMARY KEY using index "prover_machines_pkey";

alter table "public"."proofs" add constraint "proofs_machine_id_fkey" FOREIGN KEY (machine_id) REFERENCES prover_machines(id) not valid;

alter table "public"."proofs" validate constraint "proofs_machine_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.generate_machine_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    next_id INTEGER;
BEGIN
    -- Get the next available machine_id for the user
    SELECT COALESCE(MAX(machine_id), 0) + 1 INTO next_id
    FROM prover_machines
    WHERE user_id = NEW.user_id;

    -- Assign the machine_id
    NEW.machine_id = next_id;
    RETURN NEW;
END;
$function$
;

CREATE TRIGGER set_machine_id BEFORE INSERT ON public.prover_machines FOR EACH ROW EXECUTE FUNCTION generate_machine_id();
