create type "public"."report_status" as enum ('NEW', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

create sequence "public"."reports_id_seq";

alter table "public"."users" drop constraint "users_role_check";


  create table "public"."reports" (
    "id" integer not null default nextval('public.reports_id_seq'::regclass),
    "user_id" integer,
    "chapter_id" integer,
    "reason" character varying(50) not null,
    "description" text,
    "status" public.report_status default 'NEW'::public.report_status,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP
      );


alter table "public"."reports" enable row level security;

alter sequence "public"."reports_id_seq" owned by "public"."reports"."id";

CREATE INDEX idx_reports_chapter ON public.reports USING btree (chapter_id);

CREATE INDEX idx_reports_status ON public.reports USING btree (status);

CREATE INDEX idx_reports_user ON public.reports USING btree (user_id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."reports" add constraint "reports_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_chapter_id_fkey";

alter table "public"."reports" add constraint "reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_user_id_fkey";

alter table "public"."users" add constraint "users_role_check" CHECK (((role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Uploader'::character varying)::text, ('User'::character varying)::text, ('Guest'::character varying)::text]))) not valid;

alter table "public"."users" validate constraint "users_role_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_follower_count(story_id integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$BEGIN
  RETURN (
    SELECT COUNT(*)::int
    FROM user_follows
    WHERE user_follows.story_id = get_follower_count.story_id
  );
END;$function$
;


