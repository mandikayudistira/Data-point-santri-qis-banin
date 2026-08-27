--
-- PostgreSQL database dump
--

\restrict 6hoowidoXdKw0pKb1AAkP7Igbjs9UJ9K3EbntxH7uX06MlK5GflPLB5CTUd4hYG

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

ALTER TABLE IF EXISTS ONLY public.wali_santri DROP CONSTRAINT IF EXISTS wali_santri_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.wali_santri DROP CONSTRAINT IF EXISTS wali_santri_santri_id_santri_id_fk;
ALTER TABLE IF EXISTS ONLY public.riwayat_poin DROP CONSTRAINT IF EXISTS riwayat_poin_santri_id_santri_id_fk;
ALTER TABLE IF EXISTS ONLY public.riwayat_poin DROP CONSTRAINT IF EXISTS riwayat_poin_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.wali_santri DROP CONSTRAINT IF EXISTS wali_santri_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.santri DROP CONSTRAINT IF EXISTS santri_pkey;
ALTER TABLE IF EXISTS ONLY public.santri DROP CONSTRAINT IF EXISTS santri_nis_unique;
ALTER TABLE IF EXISTS ONLY public.riwayat_poin DROP CONSTRAINT IF EXISTS riwayat_poin_pkey;
ALTER TABLE IF EXISTS ONLY public.master_prestasi DROP CONSTRAINT IF EXISTS master_prestasi_pkey;
ALTER TABLE IF EXISTS ONLY public.master_prestasi DROP CONSTRAINT IF EXISTS master_prestasi_kode_unique;
ALTER TABLE IF EXISTS ONLY public.master_pelanggaran DROP CONSTRAINT IF EXISTS master_pelanggaran_pkey;
ALTER TABLE IF EXISTS ONLY public.master_pelanggaran DROP CONSTRAINT IF EXISTS master_pelanggaran_kode_unique;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
ALTER TABLE IF EXISTS public.wali_santri ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.santri ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.riwayat_poin ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.master_prestasi ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.master_pelanggaran ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_logs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.wali_santri_id_seq;
DROP TABLE IF EXISTS public.wali_santri;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.santri_id_seq;
DROP TABLE IF EXISTS public.santri;
DROP SEQUENCE IF EXISTS public.riwayat_poin_id_seq;
DROP TABLE IF EXISTS public.riwayat_poin;
DROP SEQUENCE IF EXISTS public.master_prestasi_id_seq;
DROP TABLE IF EXISTS public.master_prestasi;
DROP SEQUENCE IF EXISTS public.master_pelanggaran_id_seq;
DROP TABLE IF EXISTS public.master_pelanggaran;
DROP SEQUENCE IF EXISTS public.activity_logs_id_seq;
DROP TABLE IF EXISTS public.activity_logs;
DROP TYPE IF EXISTS public.tipe_poin;
DROP TYPE IF EXISTS public.status_santri;
DROP TYPE IF EXISTS public.role;
--
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'admin',
    'sayyid',
    'wali'
);


--
-- Name: status_santri; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_santri AS ENUM (
    'aktif',
    'nonaktif',
    'alumni'
);


--
-- Name: tipe_poin; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipe_poin AS ENUM (
    'pelanggaran',
    'prestasi'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    aksi text NOT NULL,
    detail text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: master_pelanggaran; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_pelanggaran (
    id integer NOT NULL,
    kode text NOT NULL,
    nama text NOT NULL,
    poin integer NOT NULL,
    keterangan text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: master_pelanggaran_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.master_pelanggaran_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: master_pelanggaran_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.master_pelanggaran_id_seq OWNED BY public.master_pelanggaran.id;


--
-- Name: master_prestasi; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.master_prestasi (
    id integer NOT NULL,
    kode text NOT NULL,
    nama text NOT NULL,
    poin integer NOT NULL,
    keterangan text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: master_prestasi_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.master_prestasi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: master_prestasi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.master_prestasi_id_seq OWNED BY public.master_prestasi.id;


--
-- Name: riwayat_poin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.riwayat_poin (
    id integer NOT NULL,
    santri_id integer NOT NULL,
    tipe public.tipe_poin NOT NULL,
    master_id integer,
    poin integer NOT NULL,
    keterangan text,
    tanggal text NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: riwayat_poin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.riwayat_poin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: riwayat_poin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.riwayat_poin_id_seq OWNED BY public.riwayat_poin.id;


--
-- Name: santri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.santri (
    id integer NOT NULL,
    nis text NOT NULL,
    nama text NOT NULL,
    ttl text,
    jenis_kelamin text,
    kelas text NOT NULL,
    kamar text,
    asrama text NOT NULL,
    nama_ortu text,
    no_hp text,
    status public.status_santri DEFAULT 'aktif'::public.status_santri NOT NULL,
    total_poin integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: santri_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.santri_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: santri_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.santri_id_seq OWNED BY public.santri.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role public.role DEFAULT 'sayyid'::public.role NOT NULL,
    nama text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wali_santri; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wali_santri (
    id integer NOT NULL,
    user_id integer NOT NULL,
    santri_id integer NOT NULL
);


--
-- Name: wali_santri_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wali_santri_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wali_santri_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wali_santri_id_seq OWNED BY public.wali_santri.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: master_pelanggaran id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_pelanggaran ALTER COLUMN id SET DEFAULT nextval('public.master_pelanggaran_id_seq'::regclass);


--
-- Name: master_prestasi id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_prestasi ALTER COLUMN id SET DEFAULT nextval('public.master_prestasi_id_seq'::regclass);


--
-- Name: riwayat_poin id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.riwayat_poin ALTER COLUMN id SET DEFAULT nextval('public.riwayat_poin_id_seq'::regclass);


--
-- Name: santri id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.santri ALTER COLUMN id SET DEFAULT nextval('public.santri_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wali_santri id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wali_santri ALTER COLUMN id SET DEFAULT nextval('public.wali_santri_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_id, aksi, detail, created_at) FROM stdin;
1	2	Input Pelanggaran	Bilal Firdaus - Tidak Sholat Berjamaah (-10 poin)	2026-07-24 19:55:10.878045
2	2	Input Prestasi	Muhammad Faiz - Hafal Juz Baru (+30 poin)	2026-07-24 19:55:10.878045
3	2	Input Prestasi	Zaid Mubarok - Juara 1 Lomba MTQ (+50 poin)	2026-07-24 19:55:10.878045
4	1	Tambah Santri	Menambahkan santri Umar Farouq (2024003)	2026-07-24 19:55:10.878045
5	2	Input Pelanggaran	Bilal Firdaus - Keluar Tanpa Izin (-30 poin)	2026-07-24 19:55:10.878045
6	1	Input Pelanggaran	Ahmad Rizky Pratama - Tidak Sholat Berjamaah (-10 poin)	2026-07-24 19:59:45.762277
7	1	Tambah Santri	Menambahkan santri Muhamad Andika Yudistira (200023553)	2026-07-24 20:02:54.130646
8	1	Tambah Santri	Menambahkan santri Muhamad Andika Yudistira (20240030)	2026-07-25 06:54:32.929296
9	1	Input Pelanggaran	Muhamad Andika Yudistira - Tidak Sholat Berjamaah (-10 poin)	2026-07-25 06:56:19.833611
10	1	Input Prestasi	Muhamad Andika Yudistira - Hafal Juz Baru (+30 poin)	2026-07-25 06:56:39.8987
11	1	Input Pelanggaran	Muhamad Andika Yudistira - Tidak Halaqoh (-11 poin)	2026-07-25 06:57:29.029892
12	1	Input Pelanggaran	Muhamad Andika Yudistira - Tidak Halaqoh (-11 poin)	2026-07-25 06:58:05.141858
13	1	Input Prestasi	Muhamad Andika Yudistira - Piket Terbaik (+10 poin)	2026-07-25 06:58:35.590428
14	1	Tambah Santri	Menambahkan santri Muhamad Andika Yudistira (2024003)	2026-07-25 07:09:00.864547
15	1	Tambah Santri	Menambahkan santri Fazar Alim Muhtadun (2024004)	2026-07-25 07:09:31.719412
16	1	Tambah Santri	Menambahkan santri Rakha Taufiq (20240030)	2026-07-25 07:10:12.192391
17	6	Input Prestasi	Fazar Alim Muhtadun - Juara 1 Lomba MTQ (+50 poin)	2026-07-25 07:14:01.206338
\.


--
-- Data for Name: master_pelanggaran; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.master_pelanggaran (id, kode, nama, poin, keterangan, created_at) FROM stdin;
1	P001	Tidak Sholat Berjamaah	10	Tidak mengikuti sholat berjamaah wajib	2026-07-24 19:54:49.201492
2	P002	Terlambat Masuk Kelas	5	Terlambat masuk kelas lebih dari 10 menit	2026-07-24 19:54:49.201492
3	P003	Bawa HP Tanpa Izin	25	Membawa handphone tanpa izin pengurus	2026-07-24 19:54:49.201492
4	P004	Keluar Tanpa Izin	30	Keluar lingkungan pesantren tanpa izin	2026-07-24 19:54:49.201492
5	P005	Tidak Mengikuti Kegiatan Wajib	15	Tidak hadir kegiatan wajib pesantren	2026-07-24 19:54:49.201492
6	p005	Tidak Halaqoh	11	\N	2026-07-25 06:57:17.101488
\.


--
-- Data for Name: master_prestasi; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.master_prestasi (id, kode, nama, poin, keterangan, created_at) FROM stdin;
1	PR001	Juara 1 Lomba MTQ	50	Juara pertama lomba Musabaqah Tilawatil Quran	2026-07-24 19:54:49.201492
2	PR002	Hafal Juz Baru	30	Berhasil menghafal satu juz Al-Quran baru	2026-07-24 19:54:49.201492
3	PR003	Piket Terbaik	10	Mendapat penghargaan piket terbaik minggu ini	2026-07-24 19:54:49.201492
4	PR004	Juara Kelas	25	Meraih juara kelas pada ujian semester	2026-07-24 19:54:49.201492
5	PR005	Aktif Kegiatan Ekstrakurikuler	15	Aktif mengikuti kegiatan ekstrakurikuler	2026-07-24 19:54:49.201492
\.


--
-- Data for Name: riwayat_poin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.riwayat_poin (id, santri_id, tipe, master_id, poin, keterangan, tanggal, created_by, created_at) FROM stdin;
12	16	prestasi	1	50	\N	2026-07-25T07:13:00.000Z	6	2026-07-25 07:14:01.164159
\.


--
-- Data for Name: santri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.santri (id, nis, nama, ttl, jenis_kelamin, kelas, kamar, asrama, nama_ortu, no_hp, status, total_poin, created_at) FROM stdin;
15	2024003	Muhamad Andika Yudistira	\N	L	Kelas 11 IPA	kholid bin walid	Putra	\N	\N	aktif	0	2026-07-25 07:09:00.858612
17	20240030	Rakha Taufiq	2007-05-18, Jakarta	L	Kelas 12 IPS	Salahuddin	Putra	\N	\N	aktif	0	2026-07-25 07:10:12.186223
16	2024004	Fazar Alim Muhtadun	2007-11-10, Yogyakarta	L	Kelas 11 IPA	kholid bin walid	Putra	\N	\N	aktif	50	2026-07-25 07:09:31.710771
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, role, nama, created_at) FROM stdin;
1	admin	adminpassword	admin	Administrator	2026-07-24 19:54:49.201492
6	Sayyid Anggawa Saputra	123456	sayyid	Sayyid Anggawa Saputra	2026-07-25 07:06:12.355813
7	Sayyid Ali Fauzi	123456	sayyid	Sayyid Ali Fauzi	2026-07-25 07:06:32.100852
2	Sayyid Fazar Sholeh	123456	sayyid	Sayyid Fazar Sholeh	2026-07-24 19:54:49.201492
8	Muhamad Andika Yudistira	123456	wali	Bapak Farouq Sr	2026-07-25 07:07:42.378193
9	Fazar Alim Muhtadun	123456	wali	Bapak Hasan Wali	2026-07-25 07:08:04.104225
10	Rakha Taufiq	123456	wali	bapak ahmad wali	2026-07-25 07:08:38.605022
\.


--
-- Data for Name: wali_santri; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wali_santri (id, user_id, santri_id) FROM stdin;
4	10	17
5	8	15
6	9	16
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 17, true);


--
-- Name: master_pelanggaran_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.master_pelanggaran_id_seq', 6, true);


--
-- Name: master_prestasi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.master_prestasi_id_seq', 5, true);


--
-- Name: riwayat_poin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.riwayat_poin_id_seq', 12, true);


--
-- Name: santri_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.santri_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: wali_santri_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wali_santri_id_seq', 6, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: master_pelanggaran master_pelanggaran_kode_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_pelanggaran
    ADD CONSTRAINT master_pelanggaran_kode_unique UNIQUE (kode);


--
-- Name: master_pelanggaran master_pelanggaran_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_pelanggaran
    ADD CONSTRAINT master_pelanggaran_pkey PRIMARY KEY (id);


--
-- Name: master_prestasi master_prestasi_kode_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_prestasi
    ADD CONSTRAINT master_prestasi_kode_unique UNIQUE (kode);


--
-- Name: master_prestasi master_prestasi_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.master_prestasi
    ADD CONSTRAINT master_prestasi_pkey PRIMARY KEY (id);


--
-- Name: riwayat_poin riwayat_poin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.riwayat_poin
    ADD CONSTRAINT riwayat_poin_pkey PRIMARY KEY (id);


--
-- Name: santri santri_nis_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.santri
    ADD CONSTRAINT santri_nis_unique UNIQUE (nis);


--
-- Name: santri santri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.santri
    ADD CONSTRAINT santri_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: wali_santri wali_santri_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wali_santri
    ADD CONSTRAINT wali_santri_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: riwayat_poin riwayat_poin_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.riwayat_poin
    ADD CONSTRAINT riwayat_poin_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: riwayat_poin riwayat_poin_santri_id_santri_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.riwayat_poin
    ADD CONSTRAINT riwayat_poin_santri_id_santri_id_fk FOREIGN KEY (santri_id) REFERENCES public.santri(id) ON DELETE CASCADE;


--
-- Name: wali_santri wali_santri_santri_id_santri_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wali_santri
    ADD CONSTRAINT wali_santri_santri_id_santri_id_fk FOREIGN KEY (santri_id) REFERENCES public.santri(id) ON DELETE CASCADE;


--
-- Name: wali_santri wali_santri_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wali_santri
    ADD CONSTRAINT wali_santri_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 6hoowidoXdKw0pKb1AAkP7Igbjs9UJ9K3EbntxH7uX06MlK5GflPLB5CTUd4hYG

