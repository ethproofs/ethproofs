ALTER TABLE "public"."blocks" DROP COLUMN "total_fees";

-- rename columns

ALTER TABLE "public"."clusters" RENAME COLUMN "cluster_cycle_type" TO "cycle_type";

ALTER TABLE "public"."clusters" RENAME COLUMN "cluster_description" TO "description";

ALTER TABLE "public"."clusters" RENAME COLUMN "cluster_hardware" TO "hardware";

ALTER TABLE "public"."clusters" RENAME COLUMN "cluster_id" TO "index";

ALTER TABLE "public"."clusters" RENAME COLUMN "cluster_name" TO "nickname";

ALTER TABLE "public"."clusters" RENAME COLUMN "cluster_proof_type" TO "proof_type";

-- update trigger and function to generate cluster index

DROP TRIGGER "set_cluster_id" ON "public"."clusters";
DROP FUNCTION "public"."generate_cluster_id"();

CREATE OR REPLACE FUNCTION "public"."generate_cluster_index"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    next_index INTEGER;
BEGIN
    -- Get the next available index for the user
    SELECT COALESCE(MAX(index), 0) + 1 INTO next_index
    FROM clusters
    WHERE user_id = NEW.user_id;

    -- Assign the index
    NEW.index = next_index;
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."generate_cluster_index"() OWNER TO "postgres";

CREATE OR REPLACE TRIGGER "set_cluster_index" BEFORE INSERT ON "public"."clusters" FOR EACH ROW EXECUTE FUNCTION "public"."generate_cluster_index"();