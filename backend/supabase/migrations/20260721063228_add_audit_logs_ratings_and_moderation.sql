create sequence "public"."audit_logs_id_seq";

create sequence "public"."story_ratings_id_seq";

create sequence "public"."user_chapter_reads_id_seq";

revoke references on table "public"."comment_votes" from "anon";

revoke trigger on table "public"."comment_votes" from "anon";

revoke truncate on table "public"."comment_votes" from "anon";

revoke references on table "public"."comment_votes" from "authenticated";

revoke trigger on table "public"."comment_votes" from "authenticated";

revoke truncate on table "public"."comment_votes" from "authenticated";

revoke references on table "public"."comment_votes" from "service_role";

revoke trigger on table "public"."comment_votes" from "service_role";

revoke truncate on table "public"."comment_votes" from "service_role";

revoke references on table "public"."notification_preferences" from "anon";

revoke trigger on table "public"."notification_preferences" from "anon";

revoke truncate on table "public"."notification_preferences" from "anon";

revoke references on table "public"."notification_preferences" from "authenticated";

revoke trigger on table "public"."notification_preferences" from "authenticated";

revoke truncate on table "public"."notification_preferences" from "authenticated";

revoke references on table "public"."notification_preferences" from "service_role";

revoke trigger on table "public"."notification_preferences" from "service_role";

revoke truncate on table "public"."notification_preferences" from "service_role";

revoke references on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

alter table "public"."notifications" drop constraint "notifications_type_check";


  create table "public"."audit_logs" (
    "id" bigint not null default nextval('public.audit_logs_id_seq'::regclass),
    "actor_id" integer,
    "actor_role" character varying(30) not null,
    "action" character varying(80) not null,
    "entity_type" character varying(50) not null,
    "entity_id" character varying(100),
    "details" jsonb not null default '{}'::jsonb,
    "ip_address" character varying(100),
    "created_at" timestamp with time zone not null default CURRENT_TIMESTAMP,
    "affected_user_id" integer
      );



  create table "public"."story_ratings" (
    "id" integer not null default nextval('public.story_ratings_id_seq'::regclass),
    "story_id" integer not null,
    "user_id" integer not null,
    "rating" integer not null,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );



  create table "public"."user_chapter_reads" (
    "id" integer not null default nextval('public.user_chapter_reads_id_seq'::regclass),
    "user_id" integer not null,
    "story_id" integer not null,
    "chapter_id" integer not null,
    "read_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."reports" add column "reported_user_id" integer;

alter table "public"."reports" add column "resolution_action" character varying(50);

alter table "public"."reports" add column "resolution_note" text;

alter table "public"."reports" add column "resolved_at" timestamp with time zone;

alter table "public"."reports" add column "resolved_by" integer;

alter table "public"."stories" add column "author_name" character varying(255) not null;

alter table "public"."stories" add column "moderation_note" text;

alter table "public"."stories" add column "moderation_status" character varying(30) not null default 'pending'::character varying;

alter table "public"."stories" add column "reviewed_at" timestamp without time zone;

alter table "public"."stories" add column "reviewed_by" integer;

alter table "public"."story_tags" add column "moderation_status" character varying(30) not null default 'approved'::character varying;

alter sequence "public"."audit_logs_id_seq" owned by "public"."audit_logs"."id";

alter sequence "public"."story_ratings_id_seq" owned by "public"."story_ratings"."id";

alter sequence "public"."user_chapter_reads_id_seq" owned by "public"."user_chapter_reads"."id";

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);

CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs USING btree (actor_id);

CREATE INDEX idx_audit_logs_actor_role ON public.audit_logs USING btree (actor_role);

CREATE INDEX idx_audit_logs_affected_user ON public.audit_logs USING btree (affected_user_id);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);

CREATE INDEX idx_chapters_story_published_number ON public.chapters USING btree (story_id, chapter_number) WHERE (is_published = true);

CREATE INDEX idx_comments_story_status_created ON public.comments USING btree (story_id, status, created_at DESC);

CREATE INDEX idx_reports_reported_user ON public.reports USING btree (reported_user_id);

CREATE INDEX idx_stories_category_published_created ON public.stories USING btree (category, created_at DESC) WHERE (is_published = true);

CREATE INDEX idx_stories_published_created ON public.stories USING btree (created_at DESC) WHERE (is_published = true);

CREATE INDEX idx_stories_published_updated ON public.stories USING btree (updated_at DESC) WHERE (is_published = true);

CREATE INDEX idx_stories_slug ON public.stories USING btree (slug) WHERE (slug IS NOT NULL);

CREATE INDEX idx_story_ratings_story_id ON public.story_ratings USING btree (story_id);

CREATE INDEX idx_story_ratings_user_id ON public.story_ratings USING btree (user_id);

CREATE INDEX idx_story_tags_moderation_status ON public.story_tags USING btree (story_id, moderation_status) WHERE ((moderation_status)::text <> 'approved'::text);

CREATE INDEX idx_user_chapter_reads_chapter_id ON public.user_chapter_reads USING btree (chapter_id);

CREATE INDEX idx_user_chapter_reads_user_story ON public.user_chapter_reads USING btree (user_id, story_id);

CREATE INDEX idx_user_follows_story_id ON public.user_follows USING btree (story_id);

CREATE UNIQUE INDEX story_ratings_pkey ON public.story_ratings USING btree (id);

CREATE UNIQUE INDEX story_ratings_story_id_user_id_key ON public.story_ratings USING btree (story_id, user_id);

CREATE UNIQUE INDEX user_chapter_reads_pkey ON public.user_chapter_reads USING btree (id);

CREATE UNIQUE INDEX user_chapter_reads_user_id_chapter_id_key ON public.user_chapter_reads USING btree (user_id, chapter_id);

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."story_ratings" add constraint "story_ratings_pkey" PRIMARY KEY using index "story_ratings_pkey";

alter table "public"."user_chapter_reads" add constraint "user_chapter_reads_pkey" PRIMARY KEY using index "user_chapter_reads_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_actor_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_affected_user_id_fkey" FOREIGN KEY (affected_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_affected_user_id_fkey";

alter table "public"."reports" add constraint "reports_reported_user_id_fkey" FOREIGN KEY (reported_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_reported_user_id_fkey";

alter table "public"."reports" add constraint "reports_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_resolved_by_fkey";

alter table "public"."stories" add constraint "stories_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."stories" validate constraint "stories_reviewed_by_fkey";

alter table "public"."story_ratings" add constraint "story_ratings_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."story_ratings" validate constraint "story_ratings_rating_check";

alter table "public"."story_ratings" add constraint "story_ratings_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_ratings" validate constraint "story_ratings_story_id_fkey";

alter table "public"."story_ratings" add constraint "story_ratings_story_id_user_id_key" UNIQUE using index "story_ratings_story_id_user_id_key";

alter table "public"."story_ratings" add constraint "story_ratings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."story_ratings" validate constraint "story_ratings_user_id_fkey";

alter table "public"."user_chapter_reads" add constraint "user_chapter_reads_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."user_chapter_reads" validate constraint "user_chapter_reads_chapter_id_fkey";

alter table "public"."user_chapter_reads" add constraint "user_chapter_reads_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."user_chapter_reads" validate constraint "user_chapter_reads_story_id_fkey";

alter table "public"."user_chapter_reads" add constraint "user_chapter_reads_user_id_chapter_id_key" UNIQUE using index "user_chapter_reads_user_id_chapter_id_key";

alter table "public"."user_chapter_reads" add constraint "user_chapter_reads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_chapter_reads" validate constraint "user_chapter_reads_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['new_chapter'::character varying, 'system'::character varying, 'announcement'::character varying])::text[]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";


