-- PostgreSQL initialization script for Onelga Local Services
-- This script runs when the PostgreSQL container starts for the first time

-- Create database (already created by environment variables, but included for clarity)
-- CREATE DATABASE onelga_services;

-- Connect to the database
\c onelga_services;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (Prisma will create tables)
-- These will be applied after Prisma migrations

-- Set up database configuration
ALTER DATABASE onelga_services SET timezone = 'Africa/Lagos';

-- Create a function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'Onelga Local Services database initialized successfully';
  RAISE NOTICE 'Timezone set to: %', current_setting('timezone');
END $$;
