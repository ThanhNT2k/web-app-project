--
-- PostgreSQL database dump
--

\restrict TdRBDkl5pgwqgkm0MpO9kcokezzPApNxZHlVZY4V591q7AhYFeW2Qb3Rj5blOXB

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_summaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_summaries (
    id integer NOT NULL,
    chapter_id integer,
    summary text,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ai_summaries OWNER TO postgres;

--
-- Name: ai_summaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_summaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_summaries_id_seq OWNER TO postgres;

--
-- Name: ai_summaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_summaries_id_seq OWNED BY public.ai_summaries.id;


--
-- Name: chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapters (
    id integer NOT NULL,
    story_id integer NOT NULL,
    chapter_number integer NOT NULL,
    title character varying(255),
    content text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_published boolean DEFAULT true NOT NULL
);


ALTER TABLE public.chapters OWNER TO postgres;

--
-- Name: chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chapters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chapters_id_seq OWNER TO postgres;

--
-- Name: chapters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapters_id_seq OWNED BY public.chapters.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    user_id integer,
    story_id integer,
    chapter_id integer,
    content text,
    rating integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT comments_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: reading_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reading_history (
    id integer NOT NULL,
    user_id integer,
    story_id integer,
    last_chapter_read integer,
    last_read_position integer DEFAULT 0 NOT NULL,
    total_read_time integer DEFAULT 0 NOT NULL,
    completion_rate double precision DEFAULT 0 NOT NULL,
    last_read_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reading_history OWNER TO postgres;

--
-- Name: reading_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reading_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reading_history_id_seq OWNER TO postgres;

--
-- Name: reading_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reading_history_id_seq OWNED BY public.reading_history.id;


--
-- Name: stories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stories (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255),
    author_id integer,
    description text,
    cover_image_url character varying(500),
    category character varying(100),
    status character varying(50) DEFAULT 'Ongoing'::character varying NOT NULL,
    total_chapters integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    CONSTRAINT stories_status_check CHECK (((status)::text = ANY ((ARRAY['Ongoing'::character varying, 'Completed'::character varying, 'Hiatus'::character varying])::text[])))
);


ALTER TABLE public.stories OWNER TO postgres;

--
-- Name: stories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stories_id_seq OWNER TO postgres;

--
-- Name: stories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stories_id_seq OWNED BY public.stories.id;


--
-- Name: story_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.story_tags (
    story_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.story_tags OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: user_follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_follows (
    id integer NOT NULL,
    user_id integer,
    story_id integer,
    followed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_follows OWNER TO postgres;

--
-- Name: user_follows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_follows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_follows_id_seq OWNER TO postgres;

--
-- Name: user_follows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_follows_id_seq OWNED BY public.user_follows.id;


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preferences (
    id integer NOT NULL,
    user_id integer,
    dark_mode boolean DEFAULT false NOT NULL,
    font_size integer DEFAULT 16 NOT NULL,
    line_spacing double precision DEFAULT 1.5 NOT NULL,
    font_family character varying(100) DEFAULT 'Arial'::character varying NOT NULL,
    theme_color character varying(50) DEFAULT 'default'::character varying NOT NULL,
    auto_bookmark boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_preferences OWNER TO postgres;

--
-- Name: user_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_preferences_id_seq OWNER TO postgres;

--
-- Name: user_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_preferences_id_seq OWNED BY public.user_preferences.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100),
    email character varying(255),
    password character varying(255) NOT NULL,
    full_name character varying(255),
    avatar_url character varying(500),
    role character varying(50) DEFAULT 'User'::character varying NOT NULL,
    bio text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['Admin'::character varying, 'Uploader'::character varying, 'User'::character varying, 'Guest'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ai_summaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_summaries ALTER COLUMN id SET DEFAULT nextval('public.ai_summaries_id_seq'::regclass);


--
-- Name: chapters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters ALTER COLUMN id SET DEFAULT nextval('public.chapters_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: reading_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history ALTER COLUMN id SET DEFAULT nextval('public.reading_history_id_seq'::regclass);


--
-- Name: stories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories ALTER COLUMN id SET DEFAULT nextval('public.stories_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: user_follows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows ALTER COLUMN id SET DEFAULT nextval('public.user_follows_id_seq'::regclass);


--
-- Name: user_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_preferences_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: ai_summaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_summaries (id, chapter_id, summary, generated_at) FROM stdin;
1	1	T├│m tß║»t mß║½u cho Ph├ám Nh├ón Tu Ti├¬n - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
2	5	T├│m tß║»t mß║½u cho Ng├ú Dß╗Ñc Phong Thi├¬n - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
3	9	T├│m tß║»t mß║½u cho ─Éß║Ñu La ─Éß║íi Lß╗Ñc - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
4	10	T├│m tß║»t mß║½u cho Thi├¬n Long B├ít Bß╗Ö - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
5	14	T├│m tß║»t mß║½u cho To├án Chß╗⌐c Ph├íp S╞░ - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
6	18	T├│m tß║»t mß║½u cho Hoa Thi├¬n Cß╗æt - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
7	19	T├│m tß║»t mß║½u cho ─Éß║íi Ch├║a Tß╗â - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
8	23	T├│m tß║»t mß║½u cho Thß║ºn ß║ñn V╞░╞íng Tß╗ìa - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
9	27	T├│m tß║»t mß║½u cho Kh├ính D╞░ Ni├¬n - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
10	28	T├│m tß║»t mß║½u cho ─É├┤ Thß╗ï Si├¬u Cß║Ñp Thß║ºn Y - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
11	2	T├│m tß║»t mß║½u cho Ph├ám Nh├ón Tu Ti├¬n - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
12	6	T├│m tß║»t mß║½u cho Ng├ú Dß╗Ñc Phong Thi├¬n - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
13	7	T├│m tß║»t mß║½u cho ─Éß║Ñu La ─Éß║íi Lß╗Ñc - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
14	11	T├│m tß║»t mß║½u cho Thi├¬n Long B├ít Bß╗Ö - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
15	15	T├│m tß║»t mß║½u cho To├án Chß╗⌐c Ph├íp S╞░ - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
16	16	T├│m tß║»t mß║½u cho Hoa Thi├¬n Cß╗æt - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
17	20	T├│m tß║»t mß║½u cho ─Éß║íi Ch├║a Tß╗â - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
18	24	T├│m tß║»t mß║½u cho Thß║ºn ß║ñn V╞░╞íng Tß╗ìa - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
19	25	T├│m tß║»t mß║½u cho Kh├ính D╞░ Ni├¬n - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
20	29	T├│m tß║»t mß║½u cho ─É├┤ Thß╗ï Si├¬u Cß║Ñp Thß║ºn Y - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
21	3	T├│m tß║»t mß║½u cho Ph├ám Nh├ón Tu Ti├¬n - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
22	4	T├│m tß║»t mß║½u cho Ng├ú Dß╗Ñc Phong Thi├¬n - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
23	8	T├│m tß║»t mß║½u cho ─Éß║Ñu La ─Éß║íi Lß╗Ñc - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
24	12	T├│m tß║»t mß║½u cho Thi├¬n Long B├ít Bß╗Ö - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
25	13	T├│m tß║»t mß║½u cho To├án Chß╗⌐c Ph├íp S╞░ - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
26	17	T├│m tß║»t mß║½u cho Hoa Thi├¬n Cß╗æt - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
27	21	T├│m tß║»t mß║½u cho ─Éß║íi Ch├║a Tß╗â - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
28	22	T├│m tß║»t mß║½u cho Thß║ºn ß║ñn V╞░╞íng Tß╗ìa - ch╞░╞íng 1.	2026-06-01 22:32:27.736344
29	26	T├│m tß║»t mß║½u cho Kh├ính D╞░ Ni├¬n - ch╞░╞íng 2.	2026-06-01 22:32:27.736344
30	30	T├│m tß║»t mß║½u cho ─É├┤ Thß╗ï Si├¬u Cß║Ñp Thß║ºn Y - ch╞░╞íng 3.	2026-06-01 22:32:27.736344
\.


--
-- Data for Name: chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapters (id, story_id, chapter_number, title, content, created_at, updated_at, is_published) FROM stdin;
1	1	1	Mß╗ƒ ─Éß║ºu	Ch╞░╞íng 1 cß╗ºa Ph├ám Nh├ón Tu Ti├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
2	1	2	B╞░ß╗¢c ngoß║╖t	Ch╞░╞íng 2 cß╗ºa Ph├ám Nh├ón Tu Ti├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
3	1	3	C╞í duy├¬n	Ch╞░╞íng 3 cß╗ºa Ph├ám Nh├ón Tu Ti├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
4	2	1	Khß╗ƒi Nguy├¬n	Ch╞░╞íng 1 cß╗ºa Ng├ú Dß╗Ñc Phong Thi├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
5	2	2	Biß║┐n Cß╗æ	Ch╞░╞íng 2 cß╗ºa Ng├ú Dß╗Ñc Phong Thi├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
6	2	3	─Éß╗Öt Ph├í	Ch╞░╞íng 3 cß╗ºa Ng├ú Dß╗Ñc Phong Thi├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
7	3	1	Gi├íc Ngß╗Ö	Ch╞░╞íng 1 cß╗ºa ─Éß║Ñu La ─Éß║íi Lß╗Ñc. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
8	3	2	R├¿n Luyß╗çn	Ch╞░╞íng 2 cß╗ºa ─Éß║Ñu La ─Éß║íi Lß╗Ñc. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
9	3	3	─Éß╗æi ─Éß║ºu	Ch╞░╞íng 3 cß╗ºa ─Éß║Ñu La ─Éß║íi Lß╗Ñc. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
10	4	1	L╞░u Lß║íc	Ch╞░╞íng 1 cß╗ºa Thi├¬n Long B├ít Bß╗Ö. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
11	4	2	Hiß╗çn Th├ón	Ch╞░╞íng 2 cß╗ºa Thi├¬n Long B├ít Bß╗Ö. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
12	4	3	Phß║ún K├¡ch	Ch╞░╞íng 3 cß╗ºa Thi├¬n Long B├ít Bß╗Ö. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
13	5	1	Thß╗⌐c Tß╗ënh	Ch╞░╞íng 1 cß╗ºa To├án Chß╗⌐c Ph├íp S╞░. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
14	5	2	Thß╗¡ Th├ích	Ch╞░╞íng 2 cß╗ºa To├án Chß╗⌐c Ph├íp S╞░. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
15	5	3	Khai Mß╗ƒ	Ch╞░╞íng 3 cß╗ºa To├án Chß╗⌐c Ph├íp S╞░. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
16	6	1	Gß║╖p Gß╗í	Ch╞░╞íng 1 cß╗ºa Hoa Thi├¬n Cß╗æt. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
17	6	2	M├óu Thuß║½n	Ch╞░╞íng 2 cß╗ºa Hoa Thi├¬n Cß╗æt. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
18	6	3	Lß╗▒a Chß╗ìn	Ch╞░╞íng 3 cß╗ºa Hoa Thi├¬n Cß╗æt. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
19	7	1	─Éß║íi Thi├¬n	Ch╞░╞íng 1 cß╗ºa ─Éß║íi Ch├║a Tß╗â. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
20	7	2	Thi├¬n T├ái	Ch╞░╞íng 2 cß╗ºa ─Éß║íi Ch├║a Tß╗â. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
21	7	3	Thi ─Éß║Ñu	Ch╞░╞íng 3 cß╗ºa ─Éß║íi Ch├║a Tß╗â. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
22	8	1	X├óm L╞░ß╗úc	Ch╞░╞íng 1 cß╗ºa Thß║ºn ß║ñn V╞░╞íng Tß╗ìa. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
23	8	2	Thi├¬n Ph├║	Ch╞░╞íng 2 cß╗ºa Thß║ºn ß║ñn V╞░╞íng Tß╗ìa. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
24	8	3	Tuyß╗ân Chß╗ìn	Ch╞░╞íng 3 cß╗ºa Thß║ºn ß║ñn V╞░╞íng Tß╗ìa. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
25	9	1	Cß╗ò ─Éß║íi	Ch╞░╞íng 1 cß╗ºa Kh├ính D╞░ Ni├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
26	9	2	Sinh Tß╗ôn	Ch╞░╞íng 2 cß╗ºa Kh├ính D╞░ Ni├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
27	9	3	Tiß║┐n Kinh	Ch╞░╞íng 3 cß╗ºa Kh├ính D╞░ Ni├¬n. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
28	10	1	Truyß╗ün Thß╗½a	Ch╞░╞íng 1 cß╗ºa ─É├┤ Thß╗ï Si├¬u Cß║Ñp Thß║ºn Y. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
29	10	2	Cß╗⌐u Ng╞░ß╗¥i	Ch╞░╞íng 2 cß╗ºa ─É├┤ Thß╗ï Si├¬u Cß║Ñp Thß║ºn Y. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
30	10	3	─Éß╗æi ─Éß║ºu	Ch╞░╞íng 3 cß╗ºa ─É├┤ Thß╗ï Si├¬u Cß║Ñp Thß║ºn Y. ─É├óy l├á nß╗Öi dung mß║½u phß╗Ñc vß╗Ñ kiß╗âm thß╗¡ dß╗» liß╗çu.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, user_id, story_id, chapter_id, content, rating, created_at, updated_at) FROM stdin;
11	4	1	2	Truyß╗çn c├│ nhiß╗üu triß║┐t l├╜ s├óu sß║»c vß╗ü cuß╗Öc sß╗æng.	4	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
1	3	1	1	Truyß╗çn qu├í hay, ─æß╗ìc m├¬ lu├┤n!	3	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
12	5	2	6	Th├¡ch c├ích x├óy dß╗▒ng thß║┐ giß╗¢i trong truyß╗çn n├áy.	5	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
2	4	2	5	Ch╞░╞íng n├áy cao tr├áo qu├í, kh├┤ng thß╗â ngß╗½ng ─æß╗ìc.	4	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
13	3	3	7	Mß╗æi quan hß╗ç giß╗»a c├íc nh├ón vß║¡t rß║Ñt th├║ vß╗ï.	3	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
3	5	3	9	Cß╗æt truyß╗çn rß║Ñt hß║Ñp dß║½n, mong t├íc giß║ú cß║¡p nhß║¡t th╞░ß╗¥ng xuy├¬n.	5	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
14	4	4	11	Ch╞░╞íng n├áy h╞íi ngß║»n, mong ch╞░╞íng sau d├ái h╞ín.	4	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
4	3	4	10	Nh├ón vß║¡t ch├¡nh qu├í b├í ─æß║ío, th├¡ch gh├¬!	3	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
15	5	5	15	─É├óy l├á bß╗Ö truyß╗çn ti├¬n hiß╗çp hay nhß║Ñt m├¼nh tß╗½ng ─æß╗ìc.	5	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
5	4	5	14	Hß╗ç thß╗æng tu luyß╗çn rß║Ñt logic v├á chß║╖t chß║╜.	4	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
16	3	6	16	Hß╗ç thß╗æng chiß║┐n ─æß║Ñu rß║Ñt s├íng tß║ío v├á mß╗¢i lß║í.	3	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
6	5	6	18	─Éß╗ìc truyß╗çn n├áy mß║Ñt ngß╗º mß║Ñy ─æ├¬m liß╗ün rß╗ôi.	5	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
17	4	7	20	─É├ú ─æß╗ìc ─æi ─æß╗ìc lß║íi ba lß║ºn vß║½n thß║Ñy hay.	4	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
7	3	7	19	Cß║úm ╞ín t├íc giß║ú ─æ├ú viß║┐t mß╗Öt bß╗Ö truyß╗çn tuyß╗çt vß╗¥i!	3	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
18	5	8	24	Mong t├íc giß║ú th├¬m nhiß╗üu cß║únh chiß║┐n ─æß║Ñu h╞ín.	5	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
8	4	8	23	Plot twist ch╞░╞íng n├áy khiß║┐n m├¼nh sß╗æc thß║¡t sß╗▒.	4	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
19	3	9	25	Nh├ón vß║¡t nß╗» ch├¡nh rß║Ñt c├│ chiß╗üu s├óu.	3	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
9	5	9	27	Mong t├íc giß║ú kh├┤ng bß╗Å truyß╗çn, ─æang rß║Ñt hay.	5	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
20	4	10	29	Cß╗æt truyß╗çn c├│ nhiß╗üu bß║Ñt ngß╗¥, rß║Ñt kh├│ ─æo├ín.	4	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
10	3	10	28	V─ân phong m╞░ß╗út m├á, dß╗ïch rß║Ñt tß╗æt.	3	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
28	7	1	2	─æß╗ënh vß║úi	\N	2026-06-01 22:56:32.941001	2026-06-01 22:56:32.941001
30	7	4	11	truyß╗çn tß║⌐m ─æ├í	\N	2026-06-01 23:08:20.579982	2026-06-01 23:08:20.579982
\.


--
-- Data for Name: reading_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reading_history (id, user_id, story_id, last_chapter_read, last_read_position, total_read_time, completion_rate, last_read_at, created_at) FROM stdin;
1	3	1	3	120	3600	1	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
2	3	3	8	60	2400	0.67	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
3	3	5	13	30	900	0.33	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
4	4	6	18	140	5400	1	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
5	4	9	26	70	1800	0.67	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
6	5	2	4	20	600	0.33	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
7	5	4	12	150	4200	1	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
8	5	7	20	80	2100	0.67	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344
62	7	10	28	0	15	33	2026-06-01 23:03:19.965323	2026-06-01 23:03:03.095388
65	7	4	11	573	29	67	2026-06-01 23:08:23.588476	2026-06-01 23:07:53.323208
74	1	1	1	0	76	33	2026-06-01 23:25:06.12292	2026-06-01 23:23:18.568793
41	6	2	5	300	16	67	2026-06-01 22:55:33.213158	2026-06-01 22:55:20.97556
47	7	1	2	300	12	67	2026-06-01 22:57:12.735676	2026-06-01 22:56:28.849097
56	7	2	4	300	4	33	2026-06-01 22:57:24.130043	2026-06-01 22:57:19.278526
59	7	7	19	0	7	33	2026-06-01 22:57:36.198976	2026-06-01 22:57:28.174433
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stories (id, title, slug, author_id, description, cover_image_url, category, status, total_chapters, created_at, updated_at, is_published) FROM stdin;
10	─É├┤ Thß╗ï Si├¬u Cß║Ñp Thß║ºn Y	do-thi-sieu-cap-than-y	2	Mß╗Öt thanh ni├¬n b├¼nh th╞░ß╗¥ng trß╗ƒ th├ánh thß║ºn y giß╗»a ─æ├┤ thß╗ï.	https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80	Do Thi	Ongoing	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.234553	t
11	Truyen bede	truyen-bede	1	day la truyen bede	http://localhost:5000/uploads/covers/1780330951009-221924225.png	Tien Hiep	Ongoing	0	2026-06-01 23:09:41.074834	2026-06-01 23:29:25.278859	t
1	Ph├ám Nh├ón Tu Ti├¬n	pham-nhan-tu-tien	2	H├án Lß║¡p b╞░ß╗¢c v├áo con ─æ╞░ß╗¥ng tu ti├¬n tß╗½ th├ón phß║¡n b├¼nh ph├ám.	https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80	Tien Hiep	Completed	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.224948	t
2	Ng├ú Dß╗Ñc Phong Thi├¬n	nga-duc-phong-thien	2	H├ánh tr├¼nh phong thi├¬n x╞░ng ─æß║┐ giß╗»a thß║┐ giß╗¢i tu ch├ón.	https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80	Tien Hiep	Ongoing	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.229446	t
3	─Éß║Ñu La ─Éß║íi Lß╗Ñc	dau-la-dai-luc	2	─É╞░ß╗¥ng Tam chuyß╗ân sinh v├á b╞░ß╗¢c v├áo ─æß║íi lß╗Ñc hß╗ôn s╞░.	https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80	Huyen Huyen	Completed	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.230356	t
4	Thi├¬n Long B├ít Bß╗Ö	thien-long-bat-bo	2	Giang hß╗ô ├ón o├ín vß╗¢i ba nh├ón vß║¡t trung t├óm nß╗òi bß║¡t.	https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80	Kiem Hiep	Completed	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.230995	t
5	To├án Chß╗⌐c Ph├íp S╞░	toan-chuc-phap-su	2	Thß║┐ giß╗¢i n╞íi ma ph├íp thay thß║┐ khoa hß╗ìc hiß╗çn ─æß║íi.	https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80	Huyen Huyen	Ongoing	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.231555	t
6	Hoa Thi├¬n Cß╗æt	hoa-thien-cot	2	Mß╗æi t├¼nh ngang tr├íi giß╗»a Hoa Thi├¬n Cß╗æt v├á Bß║ích Tß╗¡ Hß╗ìa.	https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=800&q=80	Ngon Tinh	Completed	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.232141	t
7	─Éß║íi Ch├║a Tß╗â	dai-chua-te	2	Mß╗Ñc Trß║ºn tiß║┐n v├áo ─Éß║íi Thi├¬n Thß║┐ Giß╗¢i rß╗Öng lß╗¢n.	https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80	Huyen Huyen	Ongoing	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.232656	t
8	Thß║ºn ß║ñn V╞░╞íng Tß╗ìa	than-an-vuong-toa	2	Nh├ón loß║íi chß╗æng lß║íi ma tß╗Öc bß║▒ng sß╗⌐c mß║ính th├ính ─æiß╗çn.	https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80	Huyen Huyen	Ongoing	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.23319	t
9	Kh├ính D╞░ Ni├¬n	khanh-du-nien	2	Phß║ím Nh├án ─æß╗æi mß║╖t m╞░u m├┤ triß╗üu ─æ├¼nh v├á thß║┐ lß╗▒c quyß╗ün qu├╜.	https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?auto=format&fit=crop&w=800&q=80	Lich Su	Completed	3	2026-06-01 22:32:27.736344	2026-06-01 23:00:57.233759	t
\.


--
-- Data for Name: story_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.story_tags (story_id, tag_id) FROM stdin;
1	1
2	1
3	2
4	3
5	2
6	4
7	2
8	2
9	5
10	6
11	17
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, name, slug, created_at) FROM stdin;
1	Tien Hiep	tien-hiep	2026-06-01 22:32:08.955804
3	Kiem Hiep	kiem-hiep	2026-06-01 22:32:08.972224
4	Ngon Tinh	ngon-tinh	2026-06-01 22:32:08.977805
2	Huyen Huyen	huyen-huyen	2026-06-01 22:32:08.968556
5	Lich Su	lich-su	2026-06-01 22:32:08.984065
6	Do Thi	do-thi	2026-06-01 22:32:08.986255
17	Bede	bede	2026-06-01 23:09:16.53704
\.


--
-- Data for Name: user_follows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_follows (id, user_id, story_id, followed_at) FROM stdin;
10	1	1	2026-06-01 22:51:05.357195
14	6	1	2026-06-01 22:53:28.454254
15	6	2	2026-06-01 22:55:19.752748
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preferences (id, user_id, dark_mode, font_size, line_spacing, font_family, theme_color, auto_bookmark, updated_at) FROM stdin;
1	1	t	16	1.5	Arial	default	t	2026-06-01 22:32:27.736344
2	2	f	17	1.6	Georgia	sepia	t	2026-06-01 22:32:27.736344
3	3	t	18	1.7	Verdana	dark	t	2026-06-01 22:32:27.736344
4	4	f	15	1.4	Arial	light	f	2026-06-01 22:32:27.736344
5	5	t	16	1.5	Tahoma	midnight	t	2026-06-01 22:32:27.736344
105	7	f	24	1.5	Inter, sans-serif	default	t	2026-06-01 23:08:32.976505
104	6	f	16	1.5	Inter, sans-serif	default	t	2026-06-01 22:55:07.986408
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, full_name, avatar_url, role, bio, created_at, updated_at, is_active) FROM stdin;
1	admin	admin@cmctruyen.vn	$2a$12$wF4StyNzMXDr2CdWzKDW6OjZY/oYpAXst01ITLDKLfCpH1ro.i2Ki	Quß║ún Trß╗ï Vi├¬n	\N	Admin	Quß║ún trß╗ï vi├¬n hß╗ç thß╗æng CMC Truyß╗çn.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
2	uploader01	uploader@cmctruyen.vn	$2a$12$wF4StyNzMXDr2CdWzKDW6OjZY/oYpAXst01ITLDKLfCpH1ro.i2Ki	Nguyß╗àn V─ân Upload	\N	Uploader	Chuy├¬n ─æ─âng truyß╗çn ti├¬n hiß╗çp v├á kiß║┐m hiß╗çp.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
3	reader01	reader01@cmctruyen.vn	$2a$12$wF4StyNzMXDr2CdWzKDW6OjZY/oYpAXst01ITLDKLfCpH1ro.i2Ki	Trß║ºn Minh ─Éß╗ìc	\N	User	M├¬ truyß╗çn ti├¬n hiß╗çp, th├¡ch tu luyß╗çn.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
4	reader02	reader02@cmctruyen.vn	$2a$12$wF4StyNzMXDr2CdWzKDW6OjZY/oYpAXst01ITLDKLfCpH1ro.i2Ki	L├¬ Thß╗ï Hß╗ông	\N	User	Fan ng├┤n t├¼nh v├á ─æ├┤ thß╗ï.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
5	reader03	reader03@cmctruyen.vn	$2a$12$wF4StyNzMXDr2CdWzKDW6OjZY/oYpAXst01ITLDKLfCpH1ro.i2Ki	Phß║ím Quß╗æc H├╣ng	\N	User	─Éß╗ìc truyß╗çn huyß╗ün huyß╗àn mß╗ùi ng├áy.	2026-06-01 22:32:27.736344	2026-06-01 22:32:27.736344	t
6	testuser_1780329208260	test_1780329208260@test.com	$2a$10$C5aMBiSUgKbzDBPkDaVDo.zAhWW8t/O2FU6tG137SZRI8n/vjXL9S	Test User	\N	User	\N	2026-06-01 22:53:28.436665	2026-06-01 22:53:28.436665	t
7	suzy	ku06042007@gmail.com	$2a$10$jvIDNMygzCZjrPs01mG1BeI7mKF18WUsh1EQetD9p0k3eIYP5MsUS	suzy	\N	User	\N	2026-06-01 22:56:14.850436	2026-06-01 22:56:14.850436	t
\.


--
-- Name: ai_summaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_summaries_id_seq', 30, true);


--
-- Name: chapters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chapters_id_seq', 30, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 30, true);


--
-- Name: reading_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reading_history_id_seq', 79, true);


--
-- Name: stories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stories_id_seq', 11, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 17, true);


--
-- Name: user_follows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_follows_id_seq', 17, true);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_preferences_id_seq', 118, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: ai_summaries ai_summaries_chapter_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_summaries
    ADD CONSTRAINT ai_summaries_chapter_id_key UNIQUE (chapter_id);


--
-- Name: ai_summaries ai_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_summaries
    ADD CONSTRAINT ai_summaries_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_story_id_chapter_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_story_id_chapter_number_key UNIQUE (story_id, chapter_number);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: reading_history reading_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_pkey PRIMARY KEY (id);


--
-- Name: reading_history reading_history_user_id_story_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_user_id_story_id_key UNIQUE (user_id, story_id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: stories stories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_slug_key UNIQUE (slug);


--
-- Name: story_tags story_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_tags
    ADD CONSTRAINT story_tags_pkey PRIMARY KEY (story_id, tag_id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- Name: user_follows user_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (id);


--
-- Name: user_follows user_follows_user_id_story_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_user_id_story_id_key UNIQUE (user_id, story_id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_chapters_story_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chapters_story_id ON public.chapters USING btree (story_id);


--
-- Name: idx_comments_story_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_story_id ON public.comments USING btree (story_id);


--
-- Name: idx_comments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);


--
-- Name: idx_reading_history_story_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_history_story_id ON public.reading_history USING btree (story_id);


--
-- Name: idx_reading_history_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reading_history_user_id ON public.reading_history USING btree (user_id);


--
-- Name: idx_stories_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stories_author_id ON public.stories USING btree (author_id);


--
-- Name: idx_story_tags_story_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_tags_story_id ON public.story_tags USING btree (story_id);


--
-- Name: idx_story_tags_tag_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_story_tags_tag_id ON public.story_tags USING btree (tag_id);


--
-- Name: idx_user_follows_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_follows_user_id ON public.user_follows USING btree (user_id);


--
-- Name: chapters trg_chapters_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments trg_comments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stories trg_stories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_stories_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_preferences trg_user_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_summaries ai_summaries_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_summaries
    ADD CONSTRAINT ai_summaries_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id);


--
-- Name: chapters chapters_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: comments comments_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE SET NULL;


--
-- Name: comments comments_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reading_history reading_history_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id);


--
-- Name: reading_history reading_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_history
    ADD CONSTRAINT reading_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: stories stories_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: story_tags story_tags_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_tags
    ADD CONSTRAINT story_tags_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: story_tags story_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.story_tags
    ADD CONSTRAINT story_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: user_follows user_follows_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id);


--
-- Name: user_follows user_follows_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict TdRBDkl5pgwqgkm0MpO9kcokezzPApNxZHlVZY4V591q7AhYFeW2Qb3Rj5blOXB

