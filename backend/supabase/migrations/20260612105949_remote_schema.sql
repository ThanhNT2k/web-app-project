


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




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_follower_count"("story_id" integer) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$BEGIN
  RETURN (
    SELECT COUNT(*)::int
    FROM user_follows
    WHERE user_follows.story_id = get_follower_count.story_id
  );
END;$$;


ALTER FUNCTION "public"."get_follower_count"("story_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_summaries" (
    "id" integer NOT NULL,
    "chapter_id" integer,
    "summary" "text",
    "generated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."ai_summaries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ai_summaries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."ai_summaries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ai_summaries_id_seq" OWNED BY "public"."ai_summaries"."id";



CREATE TABLE IF NOT EXISTS "public"."chapters" (
    "id" integer NOT NULL,
    "story_id" integer NOT NULL,
    "chapter_number" integer NOT NULL,
    "title" character varying(255),
    "content" "text",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "is_published" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."chapters" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."chapters_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."chapters_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."chapters_id_seq" OWNED BY "public"."chapters"."id";



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" integer NOT NULL,
    "user_id" integer,
    "story_id" integer,
    "chapter_id" integer,
    "content" "text",
    "rating" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "comments_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."comments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comments_id_seq" OWNED BY "public"."comments"."id";



CREATE TABLE IF NOT EXISTS "public"."reading_history" (
    "id" integer NOT NULL,
    "user_id" integer,
    "story_id" integer,
    "last_chapter_read" integer,
    "last_read_position" integer DEFAULT 0 NOT NULL,
    "total_read_time" integer DEFAULT 0 NOT NULL,
    "completion_rate" double precision DEFAULT 0 NOT NULL,
    "last_read_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."reading_history" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."reading_history_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."reading_history_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."reading_history_id_seq" OWNED BY "public"."reading_history"."id";



CREATE TABLE IF NOT EXISTS "public"."stories" (
    "id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "slug" character varying(255),
    "author_id" integer,
    "description" "text",
    "cover_image_url" character varying(500),
    "category" character varying(100),
    "status" character varying(50) DEFAULT 'Ongoing'::character varying NOT NULL,
    "total_chapters" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "is_published" boolean DEFAULT false NOT NULL,
    "hidden_by_admin" boolean DEFAULT false NOT NULL,
    CONSTRAINT "stories_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('Ongoing'::character varying)::"text", ('Completed'::character varying)::"text", ('Hiatus'::character varying)::"text"])))
);


ALTER TABLE "public"."stories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."stories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."stories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."stories_id_seq" OWNED BY "public"."stories"."id";



CREATE TABLE IF NOT EXISTS "public"."story_tags" (
    "story_id" integer NOT NULL,
    "tag_id" integer NOT NULL
);


ALTER TABLE "public"."story_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tags_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tags_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tags_id_seq" OWNED BY "public"."tags"."id";



CREATE TABLE IF NOT EXISTS "public"."user_follows" (
    "id" integer NOT NULL,
    "user_id" integer,
    "story_id" integer,
    "followed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."user_follows" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_follows_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_follows_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_follows_id_seq" OWNED BY "public"."user_follows"."id";



CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" integer NOT NULL,
    "user_id" integer,
    "dark_mode" boolean DEFAULT false NOT NULL,
    "font_size" integer DEFAULT 16 NOT NULL,
    "line_spacing" double precision DEFAULT 1.5 NOT NULL,
    "font_family" character varying(100) DEFAULT 'Arial'::character varying NOT NULL,
    "theme_color" character varying(50) DEFAULT 'default'::character varying NOT NULL,
    "auto_bookmark" boolean DEFAULT true NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_preferences_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_preferences_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_preferences_id_seq" OWNED BY "public"."user_preferences"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "username" character varying(100),
    "email" character varying(255),
    "password" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "avatar_url" character varying(500),
    "role" character varying(50) DEFAULT 'User'::character varying NOT NULL,
    "bio" "text",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "users_role_check" CHECK ((("role")::"text" = ANY (ARRAY[('Admin'::character varying)::"text", ('Uploader'::character varying)::"text", ('User'::character varying)::"text", ('Guest'::character varying)::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



ALTER TABLE ONLY "public"."ai_summaries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ai_summaries_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."chapters" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chapters_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."comments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."comments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."reading_history" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."reading_history_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."stories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."stories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tags" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tags_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_follows" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_follows_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_preferences" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_preferences_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ai_summaries"
    ADD CONSTRAINT "ai_summaries_chapter_id_key" UNIQUE ("chapter_id");



ALTER TABLE ONLY "public"."ai_summaries"
    ADD CONSTRAINT "ai_summaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_story_id_chapter_number_key" UNIQUE ("story_id", "chapter_number");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_history"
    ADD CONSTRAINT "reading_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_history"
    ADD CONSTRAINT "reading_history_user_id_story_id_key" UNIQUE ("user_id", "story_id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."story_tags"
    ADD CONSTRAINT "story_tags_pkey" PRIMARY KEY ("story_id", "tag_id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_user_id_story_id_key" UNIQUE ("user_id", "story_id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_chapters_story_id" ON "public"."chapters" USING "btree" ("story_id");



CREATE INDEX "idx_comments_story_id" ON "public"."comments" USING "btree" ("story_id");



CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_reading_history_story_id" ON "public"."reading_history" USING "btree" ("story_id");



CREATE INDEX "idx_reading_history_user_id" ON "public"."reading_history" USING "btree" ("user_id");



CREATE INDEX "idx_stories_author_id" ON "public"."stories" USING "btree" ("author_id");



CREATE INDEX "idx_story_tags_story_id" ON "public"."story_tags" USING "btree" ("story_id");



CREATE INDEX "idx_story_tags_tag_id" ON "public"."story_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_user_follows_user_id" ON "public"."user_follows" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "trg_chapters_updated_at" BEFORE UPDATE ON "public"."chapters" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_stories_updated_at" BEFORE UPDATE ON "public"."stories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_user_preferences_updated_at" BEFORE UPDATE ON "public"."user_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."ai_summaries"
    ADD CONSTRAINT "ai_summaries_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id");



ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."reading_history"
    ADD CONSTRAINT "reading_history_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id");



ALTER TABLE ONLY "public"."reading_history"
    ADD CONSTRAINT "reading_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."story_tags"
    ADD CONSTRAINT "story_tags_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_tags"
    ADD CONSTRAINT "story_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id");



ALTER TABLE ONLY "public"."user_follows"
    ADD CONSTRAINT "user_follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;




































































































































































































drop extension if exists "pg_net";

revoke references on table "public"."ai_summaries" from "anon";

revoke trigger on table "public"."ai_summaries" from "anon";

revoke truncate on table "public"."ai_summaries" from "anon";

revoke references on table "public"."ai_summaries" from "authenticated";

revoke trigger on table "public"."ai_summaries" from "authenticated";

revoke truncate on table "public"."ai_summaries" from "authenticated";

revoke references on table "public"."ai_summaries" from "service_role";

revoke trigger on table "public"."ai_summaries" from "service_role";

revoke truncate on table "public"."ai_summaries" from "service_role";

revoke references on table "public"."chapters" from "anon";

revoke trigger on table "public"."chapters" from "anon";

revoke truncate on table "public"."chapters" from "anon";

revoke references on table "public"."chapters" from "authenticated";

revoke trigger on table "public"."chapters" from "authenticated";

revoke truncate on table "public"."chapters" from "authenticated";

revoke references on table "public"."chapters" from "service_role";

revoke trigger on table "public"."chapters" from "service_role";

revoke truncate on table "public"."chapters" from "service_role";

revoke references on table "public"."comments" from "anon";

revoke trigger on table "public"."comments" from "anon";

revoke truncate on table "public"."comments" from "anon";

revoke references on table "public"."comments" from "authenticated";

revoke trigger on table "public"."comments" from "authenticated";

revoke truncate on table "public"."comments" from "authenticated";

revoke references on table "public"."comments" from "service_role";

revoke trigger on table "public"."comments" from "service_role";

revoke truncate on table "public"."comments" from "service_role";

revoke references on table "public"."reading_history" from "anon";

revoke trigger on table "public"."reading_history" from "anon";

revoke truncate on table "public"."reading_history" from "anon";

revoke references on table "public"."reading_history" from "authenticated";

revoke trigger on table "public"."reading_history" from "authenticated";

revoke truncate on table "public"."reading_history" from "authenticated";

revoke references on table "public"."reading_history" from "service_role";

revoke trigger on table "public"."reading_history" from "service_role";

revoke truncate on table "public"."reading_history" from "service_role";

revoke references on table "public"."stories" from "anon";

revoke trigger on table "public"."stories" from "anon";

revoke truncate on table "public"."stories" from "anon";

revoke references on table "public"."stories" from "authenticated";

revoke trigger on table "public"."stories" from "authenticated";

revoke truncate on table "public"."stories" from "authenticated";

revoke references on table "public"."stories" from "service_role";

revoke trigger on table "public"."stories" from "service_role";

revoke truncate on table "public"."stories" from "service_role";

revoke references on table "public"."story_tags" from "anon";

revoke trigger on table "public"."story_tags" from "anon";

revoke truncate on table "public"."story_tags" from "anon";

revoke references on table "public"."story_tags" from "authenticated";

revoke trigger on table "public"."story_tags" from "authenticated";

revoke truncate on table "public"."story_tags" from "authenticated";

revoke references on table "public"."story_tags" from "service_role";

revoke trigger on table "public"."story_tags" from "service_role";

revoke truncate on table "public"."story_tags" from "service_role";

revoke references on table "public"."tags" from "anon";

revoke trigger on table "public"."tags" from "anon";

revoke truncate on table "public"."tags" from "anon";

revoke references on table "public"."tags" from "authenticated";

revoke trigger on table "public"."tags" from "authenticated";

revoke truncate on table "public"."tags" from "authenticated";

revoke references on table "public"."tags" from "service_role";

revoke trigger on table "public"."tags" from "service_role";

revoke truncate on table "public"."tags" from "service_role";

revoke references on table "public"."user_follows" from "anon";

revoke trigger on table "public"."user_follows" from "anon";

revoke truncate on table "public"."user_follows" from "anon";

revoke references on table "public"."user_follows" from "authenticated";

revoke trigger on table "public"."user_follows" from "authenticated";

revoke truncate on table "public"."user_follows" from "authenticated";

revoke references on table "public"."user_follows" from "service_role";

revoke trigger on table "public"."user_follows" from "service_role";

revoke truncate on table "public"."user_follows" from "service_role";

revoke references on table "public"."user_preferences" from "anon";

revoke trigger on table "public"."user_preferences" from "anon";

revoke truncate on table "public"."user_preferences" from "anon";

revoke references on table "public"."user_preferences" from "authenticated";

revoke trigger on table "public"."user_preferences" from "authenticated";

revoke truncate on table "public"."user_preferences" from "authenticated";

revoke references on table "public"."user_preferences" from "service_role";

revoke trigger on table "public"."user_preferences" from "service_role";

revoke truncate on table "public"."user_preferences" from "service_role";

revoke references on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke references on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";


