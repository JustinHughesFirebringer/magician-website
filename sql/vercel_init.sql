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
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
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
CREATE INDEX idx_magicians_rating ON magicians (rating DESC);
CREATE INDEX idx_magicians_review_count ON magicians (review_count DESC);
CREATE INDEX idx_magician_locations_coords ON magician_locations (latitude, longitude);

-- Insert sample data
INSERT INTO magicians (name, business_name, description, rating, review_count, verified) VALUES
('John Smith', 'Amazing Magic Shows', 'Professional magician specializing in close-up magic and mentalism', 4.8, 125, true),
('Sarah Johnson', 'Magic Moments', 'Family-friendly magic shows perfect for birthdays and events', 4.9, 89, true),
('Michael Chen', 'Mystical Mike', 'Corporate event specialist with grand illusions', 4.7, 156, true);

-- Add locations
INSERT INTO magician_locations (magician_id, city, state, latitude, longitude) VALUES
(1, 'Austin', 'TX', 30.2672, -97.7431),
(2, 'Dallas', 'TX', 32.7767, -96.7970),
(3, 'Houston', 'TX', 29.7604, -95.3698);

-- Add specialties
INSERT INTO magician_specialties (magician_id, specialty) VALUES
(1, 'Close-up Magic'),
(1, 'Mentalism'),
(2, 'Children''s Magic'),
(2, 'Comedy Magic'),
(3, 'Stage Magic'),
(3, 'Illusions');

-- Add availability
INSERT INTO magician_availability (magician_id, availability) VALUES
(1, 'Weekends'),
(1, 'Evenings'),
(2, 'Full-time'),
(3, 'By Appointment');
