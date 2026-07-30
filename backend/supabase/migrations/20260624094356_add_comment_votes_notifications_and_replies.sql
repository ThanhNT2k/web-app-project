create sequence "public"."comment_votes_id_seq";

create sequence "public"."notification_preferences_id_seq";

create sequence "public"."notifications_id_seq";

revoke references on table "public"."bad_words" from "anon";

revoke trigger on table "public"."bad_words" from "anon";

revoke truncate on table "public"."bad_words" from "anon";

revoke references on table "public"."bad_words" from "authenticated";

revoke trigger on table "public"."bad_words" from "authenticated";

revoke truncate on table "public"."bad_words" from "authenticated";

revoke references on table "public"."bad_words" from "service_role";

revoke trigger on table "public"."bad_words" from "service_role";

revoke truncate on table "public"."bad_words" from "service_role";

revoke references on table "public"."story_ratings" from "anon";

revoke trigger on table "public"."story_ratings" from "anon";

revoke truncate on table "public"."story_ratings" from "anon";

revoke references on table "public"."story_ratings" from "authenticated";

revoke trigger on table "public"."story_ratings" from "authenticated";

revoke truncate on table "public"."story_ratings" from "authenticated";

revoke references on table "public"."story_ratings" from "service_role";

revoke trigger on table "public"."story_ratings" from "service_role";

revoke truncate on table "public"."story_ratings" from "service_role";


  create table "public"."comment_votes" (
    "id" bigint not null default nextval('public.comment_votes_id_seq'::regclass),
    "comment_id" integer not null,
    "user_id" integer not null,
    "value" smallint not null,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );



  create table "public"."notification_preferences" (
    "id" integer not null default nextval('public.notification_preferences_id_seq'::regclass),
    "user_id" integer not null,
    "email_new_chapter" boolean not null default true,
    "push_new_chapter" boolean not null default true,
    "email_system" boolean not null default true,
    "push_system" boolean not null default true,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );



  create table "public"."notifications" (
    "id" integer not null default nextval('public.notifications_id_seq'::regclass),
    "user_id" integer not null,
    "story_id" integer not null,
    "chapter_id" integer,
    "message" character varying(500) not null,
    "link" character varying(500),
    "type" character varying(50) not null default 'new_chapter'::character varying,
    "is_read" boolean not null default false,
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "read_at" timestamp without time zone,
    "updated_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."comments" add column "parent_comment_id" integer;

alter table "public"."reports" add column "comment_id" integer;

alter sequence "public"."comment_votes_id_seq" owned by "public"."comment_votes"."id";

alter sequence "public"."notification_preferences_id_seq" owned by "public"."notification_preferences"."id";

alter sequence "public"."notifications_id_seq" owned by "public"."notifications"."id";

CREATE UNIQUE INDEX comment_votes_comment_id_user_id_key ON public.comment_votes USING btree (comment_id, user_id);

CREATE UNIQUE INDEX comment_votes_pkey ON public.comment_votes USING btree (id);

CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes USING btree (comment_id);

CREATE INDEX idx_comment_votes_user_id ON public.comment_votes USING btree (user_id);

CREATE INDEX idx_comments_parent_comment_id ON public.comments USING btree (parent_comment_id);

CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences USING btree (user_id);

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

CREATE INDEX idx_notifications_story_id ON public.notifications USING btree (story_id);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE INDEX idx_notifications_user_is_read ON public.notifications USING btree (user_id, is_read);

CREATE INDEX idx_reports_comment ON public.reports USING btree (comment_id);

CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (id);

CREATE UNIQUE INDEX notification_preferences_user_id_key ON public.notification_preferences USING btree (user_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

alter table "public"."comment_votes" add constraint "comment_votes_pkey" PRIMARY KEY using index "comment_votes_pkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_pkey" PRIMARY KEY using index "notification_preferences_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."comment_votes" add constraint "comment_votes_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comment_votes" validate constraint "comment_votes_comment_id_fkey";

alter table "public"."comment_votes" add constraint "comment_votes_comment_id_user_id_key" UNIQUE using index "comment_votes_comment_id_user_id_key";

alter table "public"."comment_votes" add constraint "comment_votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."comment_votes" validate constraint "comment_votes_user_id_fkey";

alter table "public"."comment_votes" add constraint "comment_votes_value_check" CHECK ((value = ANY (ARRAY['-1'::integer, 1]))) not valid;

alter table "public"."comment_votes" validate constraint "comment_votes_value_check";

alter table "public"."comments" add constraint "comments_parent_comment_id_fkey" FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_parent_comment_id_fkey";

alter table "public"."comments" add constraint "comments_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'masked'::text, 'flagged'::text, 'rejected'::text]))) not valid;

alter table "public"."comments" validate constraint "comments_status_check";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."notification_preferences" validate constraint "notification_preferences_user_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_key" UNIQUE using index "notification_preferences_user_id_key";

alter table "public"."notifications" add constraint "notifications_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_chapter_id_fkey";

alter table "public"."notifications" add constraint "notifications_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_story_id_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['new_chapter'::character varying, 'system'::character varying, 'announcement'::character varying])::text[]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."reports" add constraint "reports_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_comment_id_fkey";

CREATE TRIGGER trg_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


