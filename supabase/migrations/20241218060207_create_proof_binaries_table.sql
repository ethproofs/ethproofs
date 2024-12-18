CREATE TABLE public.proof_binaries (
  proof_id integer NOT NULL,
  proof_binary bytea NOT NULL,
  CONSTRAINT proof_binaries_pkey PRIMARY KEY (proof_id),
  CONSTRAINT proof_binaries_proof_id_fkey FOREIGN KEY (proof_id) REFERENCES public.proofs(proof_id) ON DELETE CASCADE
) WITH (OIDS=FALSE);

ALTER TABLE "public"."proof_binaries" OWNER TO "postgres";

INSERT INTO public.proof_binaries (proof_id, proof_binary)
SELECT proof_id, proof
FROM public.proofs
WHERE proof IS NOT NULL;

CREATE POLICY "Enable insert for users with an api key" ON "public"."proof_binaries" FOR INSERT WITH CHECK ("public"."is_allowed_apikey"((("current_setting"('request.headers'::"text", true))::"json" ->> 'ethkey'::"text"), '{all,write}'::"public"."key_mode"[]));

CREATE POLICY "Enable read access for all users" ON "public"."proof_binaries" FOR SELECT USING (true);

CREATE POLICY "Enable updates for users with an api key" ON "public"."proof_binaries" FOR UPDATE USING ("public"."is_allowed_apikey"((("current_setting"('request.headers'::"text", true))::"json" ->> 'ethkey'::"text"), '{all,write}'::"public"."key_mode"[]));

ALTER TABLE "public"."proof_binaries" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."proof_binaries" TO "anon";
GRANT ALL ON TABLE "public"."proof_binaries" TO "authenticated";
GRANT ALL ON TABLE "public"."proof_binaries" TO "service_role";
