alter table "public"."prover_machines" drop column "github_org";

alter table "public"."prover_machines" drop column "logo_url";

alter table "public"."prover_machines" drop column "twitter_handle";

alter table "public"."prover_machines" drop column "website_url";

alter table "public"."teams" add column "github_org" text;

alter table "public"."teams" add column "logo_url" text;

alter table "public"."teams" add column "twitter_handle" text;

alter table "public"."teams" add column "website_url" text;