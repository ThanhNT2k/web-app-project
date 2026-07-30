create sequence "public"."chapter_unlocks_id_seq";

create sequence "public"."crystal_transactions_id_seq";

alter table "public"."notifications" drop constraint "notifications_type_check";


  create table "public"."chapter_unlocks" (
    "id" integer not null default nextval('public.chapter_unlocks_id_seq'::regclass),
    "user_id" integer not null,
    "chapter_id" integer not null,
    "crystal_cost" integer not null,
    "unlocked_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );



  create table "public"."crystal_transactions" (
    "id" integer not null default nextval('public.crystal_transactions_id_seq'::regclass),
    "user_id" integer not null,
    "type" character varying(40) not null,
    "amount" integer not null,
    "balance_after" integer not null,
    "chapter_id" integer,
    "description" character varying(255),
    "created_at" timestamp without time zone not null default CURRENT_TIMESTAMP
      );


alter table "public"."chapters" add column "is_paid" boolean not null default false;

alter table "public"."user_preferences" add column "auto_unlock_next_chapter" boolean not null default false;

alter table "public"."users" add column "crystal_balance" integer not null default 50;

alter sequence "public"."chapter_unlocks_id_seq" owned by "public"."chapter_unlocks"."id";

alter sequence "public"."crystal_transactions_id_seq" owned by "public"."crystal_transactions"."id";

CREATE UNIQUE INDEX chapter_unlocks_pkey ON public.chapter_unlocks USING btree (id);

CREATE UNIQUE INDEX chapter_unlocks_user_id_chapter_id_key ON public.chapter_unlocks USING btree (user_id, chapter_id);

CREATE UNIQUE INDEX crystal_transactions_pkey ON public.crystal_transactions USING btree (id);

CREATE INDEX idx_chapter_unlocks_chapter ON public.chapter_unlocks USING btree (chapter_id);

CREATE INDEX idx_chapter_unlocks_user ON public.chapter_unlocks USING btree (user_id);

CREATE INDEX idx_crystal_transactions_user_created ON public.crystal_transactions USING btree (user_id, created_at DESC);

alter table "public"."chapter_unlocks" add constraint "chapter_unlocks_pkey" PRIMARY KEY using index "chapter_unlocks_pkey";

alter table "public"."crystal_transactions" add constraint "crystal_transactions_pkey" PRIMARY KEY using index "crystal_transactions_pkey";

alter table "public"."chapter_unlocks" add constraint "chapter_unlocks_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE not valid;

alter table "public"."chapter_unlocks" validate constraint "chapter_unlocks_chapter_id_fkey";

alter table "public"."chapter_unlocks" add constraint "chapter_unlocks_crystal_cost_check" CHECK ((crystal_cost >= 0)) not valid;

alter table "public"."chapter_unlocks" validate constraint "chapter_unlocks_crystal_cost_check";

alter table "public"."chapter_unlocks" add constraint "chapter_unlocks_user_id_chapter_id_key" UNIQUE using index "chapter_unlocks_user_id_chapter_id_key";

alter table "public"."chapter_unlocks" add constraint "chapter_unlocks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."chapter_unlocks" validate constraint "chapter_unlocks_user_id_fkey";

alter table "public"."crystal_transactions" add constraint "crystal_transactions_balance_after_check" CHECK ((balance_after >= 0)) not valid;

alter table "public"."crystal_transactions" validate constraint "crystal_transactions_balance_after_check";

alter table "public"."crystal_transactions" add constraint "crystal_transactions_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE SET NULL not valid;

alter table "public"."crystal_transactions" validate constraint "crystal_transactions_chapter_id_fkey";

alter table "public"."crystal_transactions" add constraint "crystal_transactions_type_check" CHECK (((type)::text = ANY ((ARRAY['DEMO_GRANT'::character varying, 'CHAPTER_UNLOCK'::character varying])::text[]))) not valid;

alter table "public"."crystal_transactions" validate constraint "crystal_transactions_type_check";

alter table "public"."crystal_transactions" add constraint "crystal_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."crystal_transactions" validate constraint "crystal_transactions_user_id_fkey";

alter table "public"."users" add constraint "users_crystal_balance_check" CHECK ((crystal_balance >= 0)) not valid;

alter table "public"."users" validate constraint "users_crystal_balance_check";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['new_chapter'::character varying, 'system'::character varying, 'announcement'::character varying])::text[]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";


