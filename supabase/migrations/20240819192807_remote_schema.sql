
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."blocks" (
    "block_number" bigint NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    "gas_used" bigint NOT NULL,
    "transaction_count" integer NOT NULL
);

ALTER TABLE "public"."blocks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."proofs" (
    "proof_id" integer NOT NULL,
    "block_number" bigint,
    "proof" "bytea",
    "proof_status" "text" NOT NULL,
    "prover_machine_id" integer,
    "prover_duration" interval,
    "proving_cost" numeric(10,2),
    "proving_cycles" bigint,
    "submission_time" timestamp without time zone,
    "team_id" integer,
    CONSTRAINT "proofs_proof_status_check" CHECK (("proof_status" = ANY (ARRAY['queued'::"text", 'proving'::"text", 'proved'::"text"])))
);

ALTER TABLE "public"."proofs" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."prover_machines" (
    "machine_id" integer NOT NULL,
    "team_id" integer,
    "machine_name" "text" NOT NULL
);

ALTER TABLE "public"."prover_machines" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."teams" (
    "team_id" integer NOT NULL,
    "team_name" "text" NOT NULL
);

ALTER TABLE "public"."teams" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."block_proof_stats" AS
 SELECT "b"."block_number",
    "b"."gas_used",
    "p"."proving_cost",
    "p"."prover_duration",
    "p"."proving_cycles",
    "t"."team_name",
    "pm"."machine_name"
   FROM ((("public"."blocks" "b"
     JOIN "public"."proofs" "p" ON (("b"."block_number" = "p"."block_number")))
     JOIN "public"."teams" "t" ON (("p"."team_id" = "t"."team_id")))
     JOIN "public"."prover_machines" "pm" ON (("p"."prover_machine_id" = "pm"."machine_id")));

ALTER TABLE "public"."block_proof_stats" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."proof_summary_stats" AS
 SELECT "proofs"."team_id",
    "count"("proofs"."proof_id") AS "total_proofs",
    "sum"("proofs"."proving_cycles") AS "total_cycles",
    "avg"("proofs"."prover_duration") AS "avg_proof_time",
    "sum"("proofs"."proving_cost") AS "total_proving_cost"
   FROM "public"."proofs"
  GROUP BY "proofs"."team_id";

ALTER TABLE "public"."proof_summary_stats" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."proofs_proof_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."proofs_proof_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."proofs_proof_id_seq" OWNED BY "public"."proofs"."proof_id";

CREATE SEQUENCE IF NOT EXISTS "public"."prover_machines_machine_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."prover_machines_machine_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."prover_machines_machine_id_seq" OWNED BY "public"."prover_machines"."machine_id";

CREATE TABLE IF NOT EXISTS "public"."recursive_root_proofs" (
    "root_proof_id" integer NOT NULL,
    "block_number" bigint,
    "team_id" integer,
    "root_proof" "bytea" NOT NULL,
    "root_proof_size" bigint NOT NULL,
    "total_proof_size" bigint NOT NULL
);

ALTER TABLE "public"."recursive_root_proofs" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."recursive_proof_stats" AS
 SELECT "r"."team_id",
    "t"."team_name",
    "r"."root_proof_size",
    "r"."total_proof_size",
    (("r"."total_proof_size")::numeric / (NULLIF("r"."root_proof_size", 0))::numeric) AS "compression_ratio"
   FROM ("public"."recursive_root_proofs" "r"
     JOIN "public"."teams" "t" ON (("r"."team_id" = "t"."team_id")));

ALTER TABLE "public"."recursive_proof_stats" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."recursive_root_proofs_root_proof_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."recursive_root_proofs_root_proof_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."recursive_root_proofs_root_proof_id_seq" OWNED BY "public"."recursive_root_proofs"."root_proof_id";

CREATE SEQUENCE IF NOT EXISTS "public"."teams_team_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."teams_team_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."teams_team_id_seq" OWNED BY "public"."teams"."team_id";

ALTER TABLE ONLY "public"."proofs" ALTER COLUMN "proof_id" SET DEFAULT "nextval"('"public"."proofs_proof_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."prover_machines" ALTER COLUMN "machine_id" SET DEFAULT "nextval"('"public"."prover_machines_machine_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."recursive_root_proofs" ALTER COLUMN "root_proof_id" SET DEFAULT "nextval"('"public"."recursive_root_proofs_root_proof_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."teams" ALTER COLUMN "team_id" SET DEFAULT "nextval"('"public"."teams_team_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_pkey" PRIMARY KEY ("block_number");

ALTER TABLE ONLY "public"."proofs"
    ADD CONSTRAINT "proofs_pkey" PRIMARY KEY ("proof_id");

ALTER TABLE ONLY "public"."prover_machines"
    ADD CONSTRAINT "prover_machines_pkey" PRIMARY KEY ("machine_id");

ALTER TABLE ONLY "public"."recursive_root_proofs"
    ADD CONSTRAINT "recursive_root_proofs_pkey" PRIMARY KEY ("root_proof_id");

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id");

ALTER TABLE ONLY "public"."proofs"
    ADD CONSTRAINT "proofs_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "public"."blocks"("block_number");

ALTER TABLE ONLY "public"."proofs"
    ADD CONSTRAINT "proofs_prover_machine_id_fkey" FOREIGN KEY ("prover_machine_id") REFERENCES "public"."prover_machines"("machine_id");

ALTER TABLE ONLY "public"."proofs"
    ADD CONSTRAINT "proofs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id");

ALTER TABLE ONLY "public"."prover_machines"
    ADD CONSTRAINT "prover_machines_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id");

ALTER TABLE ONLY "public"."recursive_root_proofs"
    ADD CONSTRAINT "recursive_root_proofs_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "public"."blocks"("block_number");

ALTER TABLE ONLY "public"."recursive_root_proofs"
    ADD CONSTRAINT "recursive_root_proofs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id");

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."blocks" TO "anon";
GRANT ALL ON TABLE "public"."blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."blocks" TO "service_role";

GRANT ALL ON TABLE "public"."proofs" TO "anon";
GRANT ALL ON TABLE "public"."proofs" TO "authenticated";
GRANT ALL ON TABLE "public"."proofs" TO "service_role";

GRANT ALL ON TABLE "public"."prover_machines" TO "anon";
GRANT ALL ON TABLE "public"."prover_machines" TO "authenticated";
GRANT ALL ON TABLE "public"."prover_machines" TO "service_role";

GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";

GRANT ALL ON TABLE "public"."block_proof_stats" TO "anon";
GRANT ALL ON TABLE "public"."block_proof_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."block_proof_stats" TO "service_role";

GRANT ALL ON TABLE "public"."proof_summary_stats" TO "anon";
GRANT ALL ON TABLE "public"."proof_summary_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."proof_summary_stats" TO "service_role";

GRANT ALL ON SEQUENCE "public"."proofs_proof_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."proofs_proof_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."proofs_proof_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."prover_machines_machine_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."prover_machines_machine_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."prover_machines_machine_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."recursive_root_proofs" TO "anon";
GRANT ALL ON TABLE "public"."recursive_root_proofs" TO "authenticated";
GRANT ALL ON TABLE "public"."recursive_root_proofs" TO "service_role";

GRANT ALL ON TABLE "public"."recursive_proof_stats" TO "anon";
GRANT ALL ON TABLE "public"."recursive_proof_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."recursive_proof_stats" TO "service_role";

GRANT ALL ON SEQUENCE "public"."recursive_root_proofs_root_proof_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recursive_root_proofs_root_proof_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recursive_root_proofs_root_proof_id_seq" TO "service_role";

GRANT ALL ON SEQUENCE "public"."teams_team_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teams_team_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teams_team_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
