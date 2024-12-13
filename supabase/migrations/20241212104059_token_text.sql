alter table "public"."api_auth_tokens" alter column "token" drop default;

alter table "public"."api_auth_tokens" alter column "token" set data type text using "token"::text;

CREATE OR REPLACE FUNCTION "public"."is_allowed_apikey"("apikey" "text", "keymode" "public"."key_mode"[]) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$Begin
  RETURN (SELECT EXISTS (SELECT 1
  FROM api_auth_tokens
  WHERE token=apikey
  AND mode=ANY(keymode)));
End;$$;
