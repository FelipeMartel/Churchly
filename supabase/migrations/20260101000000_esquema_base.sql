-- Esquema que ya existía en el proyecto de Supabase antes de versionar las migraciones
-- (volcado con `supabase db dump`). En el proyecto remoto NO hay que ejecutarlo: se marca
-- como aplicado con `supabase migration repair --status applied 20260101000000`.




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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."church_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "latitude" double precision,
    "longitude" double precision,
    "languages" "text"[],
    "denomination" "text",
    "city" "text",
    "island" "text",
    "website" "text",
    "instagram" "text",
    "phone" "text",
    "pastor_name" "text" NOT NULL,
    "pastor_email" "text" NOT NULL,
    "reviewed_at" timestamp with time zone,
    "rejection_reason" "text",
    "approved_church_id" "uuid",
    CONSTRAINT "church_submissions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."church_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."churches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "denomination" "text" NOT NULL,
    "address" "text",
    "island" "text" NOT NULL,
    "city" "text",
    "latitude" double precision,
    "longitude" double precision,
    "languages" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "website" "text",
    "instagram" "text",
    "phone" "text",
    "verified" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "country" "text"
);


ALTER TABLE "public"."churches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "church_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "avatar_url" "text",
    "home_island" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "church_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_times" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "church_id" "uuid" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "language" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "service_times_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."service_times" OWNER TO "postgres";


ALTER TABLE ONLY "public"."church_submissions"
    ADD CONSTRAINT "church_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."churches"
    ADD CONSTRAINT "churches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."churches"
    ADD CONSTRAINT "churches_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_church_id_key" UNIQUE ("user_id", "church_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_church_id_user_id_key" UNIQUE ("church_id", "user_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_times"
    ADD CONSTRAINT "service_times_pkey" PRIMARY KEY ("id");



CREATE INDEX "church_submissions_status_idx" ON "public"."church_submissions" USING "btree" ("status");



CREATE INDEX "churches_city_idx" ON "public"."churches" USING "btree" ("city");



CREATE INDEX "churches_denomination_idx" ON "public"."churches" USING "btree" ("denomination");



CREATE INDEX "churches_island_idx" ON "public"."churches" USING "btree" ("island");



CREATE INDEX "favorites_user_id_idx" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "reviews_church_id_idx" ON "public"."reviews" USING "btree" ("church_id");



CREATE INDEX "service_times_church_id_idx" ON "public"."service_times" USING "btree" ("church_id");



CREATE OR REPLACE TRIGGER "church_submissions_set_updated_at" BEFORE UPDATE ON "public"."church_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."church_submissions"
    ADD CONSTRAINT "church_submissions_approved_church_id_fkey" FOREIGN KEY ("approved_church_id") REFERENCES "public"."churches"("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_times"
    ADD CONSTRAINT "service_times_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE CASCADE;



CREATE POLICY "admin puede actualizar sumisiones" ON "public"."church_submissions" FOR UPDATE TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = 'felipecontactolp@gmail.com'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'felipecontactolp@gmail.com'::"text"));



CREATE POLICY "admin puede insertar iglesias" ON "public"."churches" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'felipecontactolp@gmail.com'::"text"));



CREATE POLICY "admin puede leer sumisiones" ON "public"."church_submissions" FOR SELECT TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = 'felipecontactolp@gmail.com'::"text"));



CREATE POLICY "anon puede insertar sumisiones pendientes" ON "public"."church_submissions" FOR INSERT TO "anon" WITH CHECK (("status" = 'pending'::"text"));



CREATE POLICY "authenticated users can insert reviews" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."church_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."churches" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "churches are viewable by everyone" ON "public"."churches" FOR SELECT USING (true);



ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews are viewable by everyone" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "service times are viewable by everyone" ON "public"."service_times" FOR SELECT USING (true);



ALTER TABLE "public"."service_times" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can delete own favorites" ON "public"."favorites" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can delete own reviews" ON "public"."reviews" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can insert own favorites" ON "public"."favorites" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "users can update own reviews" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can view own favorites" ON "public"."favorites" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."church_submissions" TO "anon";
GRANT ALL ON TABLE "public"."church_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."church_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."churches" TO "anon";
GRANT ALL ON TABLE "public"."churches" TO "authenticated";
GRANT ALL ON TABLE "public"."churches" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."service_times" TO "anon";
GRANT ALL ON TABLE "public"."service_times" TO "authenticated";
GRANT ALL ON TABLE "public"."service_times" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







