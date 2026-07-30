drop trigger if exists "trg_chapters_updated_at" on "public"."chapters";

drop trigger if exists "trg_comments_updated_at" on "public"."comments";

drop trigger if exists "trg_notification_preferences_updated_at" on "public"."notification_preferences";

drop trigger if exists "trg_notifications_updated_at" on "public"."notifications";

drop trigger if exists "trg_stories_updated_at" on "public"."stories";

drop trigger if exists "trg_user_preferences_updated_at" on "public"."user_preferences";

drop trigger if exists "trg_users_updated_at" on "public"."users";

revoke references on table "public"."chapter_unlocks" from "anon";

revoke trigger on table "public"."chapter_unlocks" from "anon";

revoke truncate on table "public"."chapter_unlocks" from "anon";

revoke references on table "public"."chapter_unlocks" from "authenticated";

revoke trigger on table "public"."chapter_unlocks" from "authenticated";

revoke truncate on table "public"."chapter_unlocks" from "authenticated";

revoke references on table "public"."chapter_unlocks" from "service_role";

revoke trigger on table "public"."chapter_unlocks" from "service_role";

revoke truncate on table "public"."chapter_unlocks" from "service_role";

revoke references on table "public"."crystal_transactions" from "anon";

revoke trigger on table "public"."crystal_transactions" from "anon";

revoke truncate on table "public"."crystal_transactions" from "anon";

revoke references on table "public"."crystal_transactions" from "authenticated";

revoke trigger on table "public"."crystal_transactions" from "authenticated";

revoke truncate on table "public"."crystal_transactions" from "authenticated";

revoke references on table "public"."crystal_transactions" from "service_role";

revoke trigger on table "public"."crystal_transactions" from "service_role";

revoke truncate on table "public"."crystal_transactions" from "service_role";

alter table "public"."ai_summaries" drop constraint "ai_summaries_chapter_id_fkey";

alter table "public"."audit_logs" drop constraint "audit_logs_actor_id_fkey";

alter table "public"."audit_logs" drop constraint "audit_logs_affected_user_id_fkey";

alter table "public"."chapter_unlocks" drop constraint "chapter_unlocks_chapter_id_fkey";

alter table "public"."chapter_unlocks" drop constraint "chapter_unlocks_user_id_fkey";

alter table "public"."chapters" drop constraint "chapters_story_id_fkey";

alter table "public"."comment_votes" drop constraint "comment_votes_comment_id_fkey";

alter table "public"."comment_votes" drop constraint "comment_votes_user_id_fkey";

alter table "public"."comments" drop constraint "comments_chapter_id_fkey";

alter table "public"."comments" drop constraint "comments_parent_comment_id_fkey";

alter table "public"."comments" drop constraint "comments_story_id_fkey";

alter table "public"."comments" drop constraint "comments_user_id_fkey";

alter table "public"."crystal_transactions" drop constraint "crystal_transactions_chapter_id_fkey";

alter table "public"."crystal_transactions" drop constraint "crystal_transactions_type_check";

alter table "public"."crystal_transactions" drop constraint "crystal_transactions_user_id_fkey";

alter table "public"."notification_preferences" drop constraint "notification_preferences_user_id_fkey";

alter table "public"."notifications" drop constraint "notifications_chapter_id_fkey";

alter table "public"."notifications" drop constraint "notifications_story_id_fkey";

alter table "public"."notifications" drop constraint "notifications_type_check";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."ratings" drop constraint "ratings_story_id_fkey";

alter table "public"."ratings" drop constraint "ratings_user_id_fkey";

alter table "public"."reading_history" drop constraint "reading_history_story_id_fkey";

alter table "public"."reading_history" drop constraint "reading_history_user_id_fkey";

alter table "public"."reports" drop constraint "reports_chapter_id_fkey";

alter table "public"."reports" drop constraint "reports_comment_id_fkey";

alter table "public"."reports" drop constraint "reports_reported_user_id_fkey";

alter table "public"."reports" drop constraint "reports_resolved_by_fkey";

alter table "public"."reports" drop constraint "reports_story_id_fkey";

alter table "public"."reports" drop constraint "reports_user_id_fkey";

alter table "public"."stories" drop constraint "stories_author_id_fkey";

alter table "public"."stories" drop constraint "stories_reviewed_by_fkey";

alter table "public"."story_collaborators" drop constraint "story_collaborators_story_id_fkey";

alter table "public"."story_collaborators" drop constraint "story_collaborators_user_id_fkey";

alter table "public"."story_ratings" drop constraint "story_ratings_story_id_fkey";

alter table "public"."story_ratings" drop constraint "story_ratings_user_id_fkey";

alter table "public"."story_tags" drop constraint "story_tags_story_id_fkey";

alter table "public"."story_tags" drop constraint "story_tags_tag_id_fkey";

alter table "public"."user_chapter_reads" drop constraint "user_chapter_reads_chapter_id_fkey";

alter table "public"."user_chapter_reads" drop constraint "user_chapter_reads_story_id_fkey";

alter table "public"."user_chapter_reads" drop constraint "user_chapter_reads_user_id_fkey";

alter table "public"."user_follows" drop constraint "user_follows_story_id_fkey";

alter table "public"."user_follows" drop constraint "user_follows_user_id_fkey";

alter table "public"."user_preferences" drop constraint "user_preferences_user_id_fkey";

alter table "public"."ai_summaries" alter column "id" set default nextval('public.ai_summaries_id_seq'::regclass);

alter table "public"."audit_logs" alter column "id" set default nextval('public.audit_logs_id_seq'::regclass);

alter table "public"."bad_words" alter column "id" set default nextval('public.bad_words_id_seq'::regclass);

alter table "public"."chapter_unlocks" alter column "id" set default nextval('public.chapter_unlocks_id_seq'::regclass);

alter table "public"."chapters" alter column "id" set default nextval('public.chapters_id_seq'::regclass);

alter table "public"."comment_votes" alter column "id" set default nextval('public.comment_votes_id_seq'::regclass);

alter table "public"."comments" alter column "id" set default nextval('public.comments_id_seq'::regclass);

alter table "public"."crystal_transactions" alter column "id" set default nextval('public.crystal_transactions_id_seq'::regclass);

alter table "public"."notification_preferences" alter column "id" set default nextval('public.notification_preferences_id_seq'::regclass);

alter table "public"."notifications" alter column "id" set default nextval('public.notifications_id_seq'::regclass);

alter table "public"."ratings" alter column "id" set default nextval('public.ratings_id_seq'::regclass);

alter table "public"."reading_history" alter column "id" set default nextval('public.reading_history_id_seq'::regclass);

alter table "public"."reports" alter column "id" set default nextval('public.reports_id_seq'::regclass);

alter table "public"."reports" alter column "status" set default 'NEW'::public.report_status;

alter table "public"."reports" alter column "status" set data type public.report_status using "status"::text::public.report_status;

alter table "public"."stories" alter column "id" set default nextval('public.stories_id_seq'::regclass);

alter table "public"."story_ratings" alter column "id" set default nextval('public.story_ratings_id_seq'::regclass);

alter table "public"."tags" alter column "id" set default nextval('public.tags_id_seq'::regclass);

alter table "public"."user_chapter_reads" alter column "id" set default nextval('public.user_chapter_reads_id_seq'::regclass);

alter table "public"."user_follows" alter column "id" set default nextval('public.user_follows_id_seq'::regclass);

alter table "public"."user_preferences" alter column "id" set default nextval('public.user_preferences_id_seq'::regclass);

alter table "public"."users" alter column "id" set default nextval('public.users_id_seq'::regclass);

alter table "public"."ai_summaries" add constraint "ai_summaries_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."ai_summaries" validate constraint "ai_summaries_chapter_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_actor_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_affected_user_id_fkey" FOREIGN KEY (affected_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_affected_user_id_fkey";

alter table "public"."chapter_unlocks" add constraint "chapter_unlocks_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."chapter_unlocks" validate constraint "chapter_unlocks_chapter_id_fkey";

alter table "public"."chapter_unlocks" add constraint "chapter_unlocks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."chapter_unlocks" validate constraint "chapter_unlocks_user_id_fkey";

alter table "public"."chapters" add constraint "chapters_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."chapters" validate constraint "chapters_story_id_fkey";

alter table "public"."comment_votes" add constraint "comment_votes_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comment_votes" validate constraint "comment_votes_comment_id_fkey";

alter table "public"."comment_votes" add constraint "comment_votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."comment_votes" validate constraint "comment_votes_user_id_fkey";

alter table "public"."comments" add constraint "comments_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE SET NULL not valid;

alter table "public"."comments" validate constraint "comments_chapter_id_fkey";

alter table "public"."comments" add constraint "comments_parent_comment_id_fkey" FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_parent_comment_id_fkey";

alter table "public"."comments" add constraint "comments_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) not valid;

alter table "public"."comments" validate constraint "comments_story_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."crystal_transactions" add constraint "crystal_transactions_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE SET NULL not valid;

alter table "public"."crystal_transactions" validate constraint "crystal_transactions_chapter_id_fkey";

alter table "public"."crystal_transactions" add constraint "crystal_transactions_type_check" CHECK (((type)::text = ANY ((ARRAY['DEMO_GRANT'::character varying, 'CHAPTER_UNLOCK'::character varying])::text[]))) not valid;

alter table "public"."crystal_transactions" validate constraint "crystal_transactions_type_check";

alter table "public"."crystal_transactions" add constraint "crystal_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."crystal_transactions" validate constraint "crystal_transactions_user_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."notification_preferences" validate constraint "notification_preferences_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_chapter_id_fkey";

alter table "public"."notifications" add constraint "notifications_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_story_id_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['new_chapter'::character varying, 'system'::character varying, 'announcement'::character varying])::text[]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."ratings" add constraint "ratings_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."ratings" validate constraint "ratings_story_id_fkey";

alter table "public"."ratings" add constraint "ratings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."ratings" validate constraint "ratings_user_id_fkey";

alter table "public"."reading_history" add constraint "reading_history_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) not valid;

alter table "public"."reading_history" validate constraint "reading_history_story_id_fkey";

alter table "public"."reading_history" add constraint "reading_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."reading_history" validate constraint "reading_history_user_id_fkey";

alter table "public"."reports" add constraint "reports_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_chapter_id_fkey";

alter table "public"."reports" add constraint "reports_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_comment_id_fkey";

alter table "public"."reports" add constraint "reports_reported_user_id_fkey" FOREIGN KEY (reported_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_reported_user_id_fkey";

alter table "public"."reports" add constraint "reports_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."reports" validate constraint "reports_resolved_by_fkey";

alter table "public"."reports" add constraint "reports_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_story_id_fkey";

alter table "public"."reports" add constraint "reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_user_id_fkey";

alter table "public"."stories" add constraint "stories_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.users(id) not valid;

alter table "public"."stories" validate constraint "stories_author_id_fkey";

alter table "public"."stories" add constraint "stories_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."stories" validate constraint "stories_reviewed_by_fkey";

alter table "public"."story_collaborators" add constraint "story_collaborators_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_collaborators" validate constraint "story_collaborators_story_id_fkey";

alter table "public"."story_collaborators" add constraint "story_collaborators_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."story_collaborators" validate constraint "story_collaborators_user_id_fkey";

alter table "public"."story_ratings" add constraint "story_ratings_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_ratings" validate constraint "story_ratings_story_id_fkey";

alter table "public"."story_ratings" add constraint "story_ratings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."story_ratings" validate constraint "story_ratings_user_id_fkey";

alter table "public"."story_tags" add constraint "story_tags_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_tags" validate constraint "story_tags_story_id_fkey";

alter table "public"."story_tags" add constraint "story_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE not valid;

alter table "public"."story_tags" validate constraint "story_tags_tag_id_fkey";

alter table "public"."user_chapter_reads" add constraint "user_chapter_reads_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."user_chapter_reads" validate constraint "user_chapter_reads_chapter_id_fkey";

alter table "public"."user_chapter_reads" add constraint "user_chapter_reads_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."user_chapter_reads" validate constraint "user_chapter_reads_story_id_fkey";

alter table "public"."user_chapter_reads" add constraint "user_chapter_reads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_chapter_reads" validate constraint "user_chapter_reads_user_id_fkey";

alter table "public"."user_follows" add constraint "user_follows_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) not valid;

alter table "public"."user_follows" validate constraint "user_follows_story_id_fkey";

alter table "public"."user_follows" add constraint "user_follows_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."user_follows" validate constraint "user_follows_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

CREATE TRIGGER trg_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_stories_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


