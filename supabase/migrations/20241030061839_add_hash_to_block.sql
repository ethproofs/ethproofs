-- Add hash column to blocks table
alter table "public"."blocks" add column "hash" text not null;
