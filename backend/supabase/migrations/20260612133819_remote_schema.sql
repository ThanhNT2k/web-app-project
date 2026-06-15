revoke references on table "public"."reports" from "anon";

revoke trigger on table "public"."reports" from "anon";

revoke truncate on table "public"."reports" from "anon";

revoke references on table "public"."reports" from "authenticated";

revoke trigger on table "public"."reports" from "authenticated";

revoke truncate on table "public"."reports" from "authenticated";

revoke references on table "public"."reports" from "service_role";

revoke trigger on table "public"."reports" from "service_role";

revoke truncate on table "public"."reports" from "service_role";


