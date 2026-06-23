create sequence "public"."bad_words_id_seq";

create sequence "public"."story_ratings_id_seq";

drop trigger if exists "trg_ratings_updated_at" on "public"."ratings";

revoke references on table "public"."ratings" from "anon";

revoke trigger on table "public"."ratings" from "anon";

revoke truncate on table "public"."ratings" from "anon";

revoke references on table "public"."ratings" from "authenticated";

revoke trigger on table "public"."ratings" from "authenticated";

revoke truncate on table "public"."ratings" from "authenticated";

revoke references on table "public"."ratings" from "service_role";

revoke trigger on table "public"."ratings" from "service_role";

revoke truncate on table "public"."ratings" from "service_role";

alter table "public"."users" drop constraint "users_role_check";


  create table "public"."bad_words" (
    "id" integer not null default nextval('public.bad_words_id_seq'::regclass),
    "keyword" character varying(255) not null,
    "tier" integer default 1,
    "createdAt" timestamp without time zone default now(),
    "updatedAt" timestamp without time zone default now()
      );


alter table "public"."bad_words" enable row level security;


  create table "public"."story_ratings" (
    "id" integer not null default nextval('public.story_ratings_id_seq'::regclass),
    "story_id" integer not null,
    "user_id" integer not null,
    "rating" integer not null,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."comments" add column "is_spam" boolean default false;

alter table "public"."comments" add column "status" text not null;

alter table "public"."ratings" alter column "id" set default nextval('public.ratings_id_seq'::regclass);

alter table "public"."stories" add column "monthly_views" integer not null default 0;

alter table "public"."stories" add column "total_views" integer not null default 0;

alter table "public"."stories" add column "weekly_views" integer not null default 0;

alter sequence "public"."bad_words_id_seq" owned by "public"."bad_words"."id";

alter sequence "public"."story_ratings_id_seq" owned by "public"."story_ratings"."id";

CREATE UNIQUE INDEX bad_words_pkey ON public.bad_words USING btree (id);

CREATE INDEX idx_reading_history_story_last_read_at ON public.reading_history USING btree (story_id, last_read_at);

CREATE INDEX idx_reports_story ON public.reports USING btree (story_id);

CREATE INDEX idx_story_ratings_story_id ON public.story_ratings USING btree (story_id);

CREATE INDEX idx_story_ratings_user_id ON public.story_ratings USING btree (user_id);

CREATE UNIQUE INDEX ratings_pkey ON public.ratings USING btree (id);

CREATE UNIQUE INDEX ratings_story_id_user_id_key ON public.ratings USING btree (story_id, user_id);

CREATE UNIQUE INDEX story_ratings_pkey ON public.story_ratings USING btree (id);

CREATE UNIQUE INDEX story_ratings_story_id_user_id_key ON public.story_ratings USING btree (story_id, user_id);

alter table "public"."bad_words" add constraint "bad_words_pkey" PRIMARY KEY using index "bad_words_pkey";

alter table "public"."ratings" add constraint "ratings_pkey" PRIMARY KEY using index "ratings_pkey";

alter table "public"."story_ratings" add constraint "story_ratings_pkey" PRIMARY KEY using index "story_ratings_pkey";

alter table "public"."ratings" add constraint "ratings_story_id_user_id_key" UNIQUE using index "ratings_story_id_user_id_key";

alter table "public"."reports" add constraint "reports_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_story_id_fkey";

alter table "public"."story_ratings" add constraint "story_ratings_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."story_ratings" validate constraint "story_ratings_rating_check";

alter table "public"."story_ratings" add constraint "story_ratings_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_ratings" validate constraint "story_ratings_story_id_fkey";

alter table "public"."story_ratings" add constraint "story_ratings_story_id_user_id_key" UNIQUE using index "story_ratings_story_id_user_id_key";

alter table "public"."story_ratings" add constraint "story_ratings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."story_ratings" validate constraint "story_ratings_user_id_fkey";

alter table "public"."users" add constraint "users_role_check" CHECK (((role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Uploader'::character varying)::text, ('User'::character varying)::text, ('Moderator'::character varying)::text]))) not valid;

alter table "public"."users" validate constraint "users_role_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;


