-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE specialty_type AS ENUM (
  'Close-up Magic',
  'Stage Magic',
  'Mentalism',
  'Children''s Magic',
  'Comedy Magic',
  'Illusions',
  'Card Magic',
  'Street Magic',
  'Corporate Magic'
);

CREATE TYPE availability_type AS ENUM (
  'Weekdays',
  'Weekends',
  'Evenings',
  'Full-time',
  'By Appointment'
);

-- Create tables
CREATE TABLE magicians (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  website_url VARCHAR(255),
  description TEXT,
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE magician_locations (
  id SERIAL PRIMARY KEY,
  magician_id INTEGER REFERENCES magicians(id),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  service_radius_miles INTEGER DEFAULT 50,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE magician_specialties (
  magician_id INTEGER REFERENCES magicians(id),
  specialty specialty_type NOT NULL,
  PRIMARY KEY (magician_id, specialty)
);

CREATE TABLE magician_availability (
  magician_id INTEGER REFERENCES magicians(id),
  availability availability_type NOT NULL,
  PRIMARY KEY (magician_id, availability)
);

CREATE TABLE shows (
  id SERIAL PRIMARY KEY,
  magician_id INTEGER REFERENCES magicians(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  base_price DECIMAL(10,2),
  max_audience_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  magician_id INTEGER REFERENCES magicians(id),
  reviewer_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_magician_locations_location ON magician_locations USING GIST (location);
CREATE INDEX idx_magicians_rating ON magicians (rating DESC);
CREATE INDEX idx_magicians_review_count ON magicians (review_count DESC);

-- Create a materialized view for magician search
CREATE MATERIALIZED VIEW magician_search AS
SELECT 
  m.id,
  m.name,
  m.business_name,
  m.price_range_min,
  m.price_range_max,
  m.rating,
  m.review_count,
  ml.city,
  ml.state,
  ml.location,
  array_agg(DISTINCT ms.specialty) as specialties,
  array_agg(DISTINCT ma.availability) as availability
FROM magicians m
JOIN magician_locations ml ON m.id = ml.magician_id
LEFT JOIN magician_specialties ms ON m.id = ms.magician_id
LEFT JOIN magician_availability ma ON m.id = ma.magician_id
WHERE ml.is_primary = true
GROUP BY 
  m.id, 
  m.name, 
  m.business_name, 
  m.price_range_min, 
  m.price_range_max,
  m.rating,
  m.review_count,
  ml.city,
  ml.state,
  ml.location;

-- Create index on the materialized view
CREATE INDEX idx_magician_search_location ON magician_search USING GIST (location);
CREATE INDEX idx_magician_search_specialties ON magician_search USING GIN (specialties);
CREATE INDEX idx_magician_search_rating ON magician_search (rating DESC);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_magician_search()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY magician_search;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to refresh the materialized view
CREATE TRIGGER refresh_magician_search_on_magician
AFTER INSERT OR UPDATE OR DELETE ON magicians
FOR EACH STATEMENT EXECUTE FUNCTION refresh_magician_search();

CREATE TRIGGER refresh_magician_search_on_location
AFTER INSERT OR UPDATE OR DELETE ON magician_locations
FOR EACH STATEMENT EXECUTE FUNCTION refresh_magician_search();

CREATE TRIGGER refresh_magician_search_on_specialty
AFTER INSERT OR UPDATE OR DELETE ON magician_specialties
FOR EACH STATEMENT EXECUTE FUNCTION refresh_magician_search();
