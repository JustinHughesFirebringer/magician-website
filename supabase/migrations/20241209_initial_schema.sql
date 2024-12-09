-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the magicians table
CREATE TABLE IF NOT EXISTS magicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    slug TEXT UNIQUE
);

-- Create the locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT,
    country TEXT DEFAULT 'USA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    slug TEXT UNIQUE
);

-- Create the magician_locations junction table
CREATE TABLE IF NOT EXISTS magician_locations (
    magician_id UUID REFERENCES magicians(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (magician_id, location_id)
);

-- Create the shows table
CREATE TABLE IF NOT EXISTS shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    price_range TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the magician_shows junction table
CREATE TABLE IF NOT EXISTS magician_shows (
    magician_id UUID REFERENCES magicians(id) ON DELETE CASCADE,
    show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (magician_id, show_id)
);

-- Add the slug function
CREATE OR REPLACE FUNCTION add_slug_column(table_name text, column_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = $1
        AND column_name = $2
    ) THEN
        -- Add the column if it doesn't exist
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I TEXT UNIQUE', $1, $2);
    END IF;
END;
$$;
