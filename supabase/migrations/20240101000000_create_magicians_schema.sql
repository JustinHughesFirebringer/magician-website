-- Create magicians table
create table if not exists magicians (
  id bigint primary key generated always as identity,
  name text not null,
  business_name text,
  rating numeric(3,2) check (rating >= 0 and rating <= 5),
  price_range_min numeric(10,2),
  price_range_max numeric(10,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (price_range_min <= price_range_max)
);

-- Create magician_locations table
create table if not exists magician_locations (
  id bigint primary key generated always as identity,
  magician_id bigint references magicians(id) on delete cascade,
  city text not null,
  state text not null,
  slug text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(magician_id, city, state)
);

-- Create indexes for better search performance
create index if not exists idx_magicians_name on magicians using gin(name gin_trgm_ops);
create index if not exists idx_magicians_business_name on magicians using gin(business_name gin_trgm_ops);
create index if not exists idx_magician_locations_city on magician_locations using gin(city gin_trgm_ops);
create index if not exists idx_magician_locations_state on magician_locations using gin(state gin_trgm_ops);
create index if not exists idx_magician_locations_slug on magician_locations(slug);
create index if not exists idx_magician_locations_composite on magician_locations(city, state, slug);
create index if not exists idx_magician_locations_magician_id on magician_locations(magician_id);

-- Create trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_magicians_updated_at
  before update on magicians
  for each row
  execute function update_updated_at_column();

create trigger update_magician_locations_updated_at
  before update on magician_locations
  for each row
  execute function update_updated_at_column();

-- Enable the pg_trgm extension for fuzzy text search
create extension if not exists pg_trgm;

-- Add statistics for better query planning
analyze magicians;
analyze magician_locations;
