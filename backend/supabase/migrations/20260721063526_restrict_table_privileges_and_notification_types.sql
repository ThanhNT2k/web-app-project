revoke references on table "public"."audit_logs" from "anon";

revoke trigger on table "public"."audit_logs" from "anon";

revoke truncate on table "public"."audit_logs" from "anon";

revoke references on table "public"."audit_logs" from "authenticated";

revoke trigger on table "public"."audit_logs" from "authenticated";

revoke truncate on table "public"."audit_logs" from "authenticated";

revoke references on table "public"."audit_logs" from "service_role";

revoke trigger on table "public"."audit_logs" from "service_role";

revoke truncate on table "public"."audit_logs" from "service_role";

revoke references on table "public"."story_ratings" from "anon";

revoke trigger on table "public"."story_ratings" from "anon";

revoke truncate on table "public"."story_ratings" from "anon";

revoke references on table "public"."story_ratings" from "authenticated";

revoke trigger on table "public"."story_ratings" from "authenticated";

revoke truncate on table "public"."story_ratings" from "authenticated";

revoke references on table "public"."story_ratings" from "service_role";

revoke trigger on table "public"."story_ratings" from "service_role";

revoke truncate on table "public"."story_ratings" from "service_role";

revoke references on table "public"."user_chapter_reads" from "anon";

revoke trigger on table "public"."user_chapter_reads" from "anon";

revoke truncate on table "public"."user_chapter_reads" from "anon";

revoke references on table "public"."user_chapter_reads" from "authenticated";

revoke trigger on table "public"."user_chapter_reads" from "authenticated";

revoke truncate on table "public"."user_chapter_reads" from "authenticated";

revoke references on table "public"."user_chapter_reads" from "service_role";

revoke trigger on table "public"."user_chapter_reads" from "service_role";

revoke truncate on table "public"."user_chapter_reads" from "service_role";

alter table "public"."notifications" drop constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['new_chapter'::character varying, 'system'::character varying, 'announcement'::character varying])::text[]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";


