-- Step 1: Drop policies that depend on the function (which depends on key_mode)
DROP POLICY IF EXISTS "Allow users to see API token entries they own" ON "public"."api_auth_tokens";--> statement-breakpoint
DROP POLICY IF EXISTS "Enable updates for users with an api key" ON "public"."proofs";--> statement-breakpoint

-- Step 2: Drop the function that depends on key_mode
DROP FUNCTION IF EXISTS "public"."is_allowed_apikey"(text, key_mode[]);--> statement-breakpoint

-- Step 3: Alter the column to text temporarily
ALTER TABLE "public"."api_auth_tokens" ALTER COLUMN "mode" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."api_auth_tokens" ALTER COLUMN "mode" SET DATA TYPE text;--> statement-breakpoint

-- Step 3.5: Update existing 'all' mode keys to 'write'
UPDATE "public"."api_auth_tokens" SET "mode" = 'write' WHERE "mode" = 'all';--> statement-breakpoint

-- Step 4: Drop and recreate the enum type
DROP TYPE "public"."key_mode";--> statement-breakpoint
CREATE TYPE "public"."key_mode" AS ENUM('admin', 'read', 'write');--> statement-breakpoint

-- Step 5: Convert the column back to the enum type
ALTER TABLE "public"."api_auth_tokens" ALTER COLUMN "mode" SET DATA TYPE "public"."key_mode" USING "mode"::"public"."key_mode";--> statement-breakpoint
ALTER TABLE "public"."api_auth_tokens" ALTER COLUMN "mode" SET DEFAULT 'read'::"public"."key_mode";--> statement-breakpoint

-- Step 6: Recreate the function with the new enum (matching original logic)
CREATE OR REPLACE FUNCTION "public"."is_allowed_apikey"(apikey text, keymode key_mode[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT EXISTS (
        SELECT 1
        FROM api_auth_tokens
        WHERE token = apikey
        AND mode = ANY(keymode)
    ));
END;
$$;--> statement-breakpoint

-- Step 7: Recreate the policies
CREATE POLICY "Allow users to see API token entries they own" ON "public"."api_auth_tokens"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{admin,read,write}'::key_mode[]));--> statement-breakpoint

CREATE POLICY "Enable updates for users with an api key" ON "public"."proofs"
AS PERMISSIVE FOR UPDATE
TO anon
USING (is_allowed_apikey(((current_setting('request.headers'::text, true))::json ->> 'ethkey'::text), '{admin,write}'::key_mode[]));
