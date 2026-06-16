-- Create story_collaborators table
CREATE TABLE IF NOT EXISTS "public"."story_collaborators" (
    "story_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "story_collaborators_pkey" PRIMARY KEY ("story_id", "user_id"),
    CONSTRAINT "story_collaborators_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE,
    CONSTRAINT "story_collaborators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

-- Owner assignment
ALTER TABLE "public"."story_collaborators" OWNER TO "postgres";

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_story_collaborators_story_id" ON "public"."story_collaborators" USING btree ("story_id");
CREATE INDEX IF NOT EXISTS "idx_story_collaborators_user_id" ON "public"."story_collaborators" USING btree ("user_id");

-- Revoke permissions to align with project security standards
revoke references on table "public"."story_collaborators" from "anon";
revoke trigger on table "public"."story_collaborators" from "anon";
revoke truncate on table "public"."story_collaborators" from "anon";

revoke references on table "public"."story_collaborators" from "authenticated";
revoke trigger on table "public"."story_collaborators" from "authenticated";
revoke truncate on table "public"."story_collaborators" from "authenticated";

revoke references on table "public"."story_collaborators" from "service_role";
revoke trigger on table "public"."story_collaborators" from "service_role";
revoke truncate on table "public"."story_collaborators" from "service_role";
