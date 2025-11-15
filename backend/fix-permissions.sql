-- Fix database permissions for development
-- Run this as the postgres superuser

-- Connect to your database first
\c fms_db

-- Grant ownership of the investments table to your user
ALTER TABLE investments OWNER TO fms_user;

-- Optionally, grant ownership of all tables to fms_user
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' OWNER TO fms_user';
    END LOOP;
END$$;

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE fms_db TO fms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fms_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO fms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO fms_user;
