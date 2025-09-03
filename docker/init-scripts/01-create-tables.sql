-- Initial database setup for Activepieces SOP Tool
-- This script runs when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create initial schema (tables will be created by TypeORM migrations)
-- This is just for database initialization

-- Set timezone
SET timezone = 'UTC';

-- Create a test query to verify database connection
CREATE OR REPLACE FUNCTION check_database_ready() RETURNS TEXT AS $$
BEGIN
    RETURN 'Activepieces SOP Database Ready';
END;
$$ LANGUAGE plpgsql;