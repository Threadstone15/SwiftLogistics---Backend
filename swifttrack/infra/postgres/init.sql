-- SwiftTrack Database Initialization Script

-- Create database if it doesn't exist (this is handled by Docker environment variables)
-- CREATE DATABASE IF NOT EXISTS swifttrack;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create initial admin user table (will be managed by TypeORM migrations later)
-- This is just a placeholder to ensure the database starts properly