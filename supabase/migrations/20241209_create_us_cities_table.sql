-- Create the us_cities table
CREATE TABLE IF NOT EXISTS public.us_cities (
    id BIGSERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    population INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Create a unique constraint on city-state combination
    CONSTRAINT unique_city_state UNIQUE (city, state)
);

-- Create an index for faster city-state lookups
CREATE INDEX IF NOT EXISTS idx_city_state ON public.us_cities (city, state);

-- Enable RLS
ALTER TABLE public.us_cities ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read
CREATE POLICY "Allow public read access"
    ON public.us_cities
    FOR SELECT
    TO public
    USING (true);
