import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

interface MagicianRecord {
  business_id: string;
  name: string;
  phone_number: string;
  full_address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  rating: number;
  website: string;
  place_link: string;
  types: string;
  price_level: string;
  timezone: string;
  working_hours: string;
}

type SpecialtyType = 
  | 'Close-up Magic'
  | 'Stage Magic'
  | 'Mentalism'
  | 'Children\'s Magic'
  | 'Comedy Magic'
  | 'Illusions'
  | 'Card Magic'
  | 'Street Magic'
  | 'Corporate Magic';

async function processCSV() {
  const records: MagicianRecord[] = [];
  const parser = createReadStream(path.join(__dirname, '500 - magicanus500.csv'))
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));

  for await (const record of parser) {
    // Skip if no business_id, name, city, or state
    if (!record.business_id || !record.name || !record.city) continue;

    // Clean up the data
    const city = record.city?.split(',')[0]?.trim();
    const state = record.city?.split(',')[1]?.trim();
    
    // Skip if city or state is missing
    if (!city || !state) continue;

    const magician: MagicianRecord = {
      business_id: record.business_id,
      name: record.name?.trim(),
      phone_number: record.phone_number?.replace(/\D/g, '') || null,
      full_address: record.full_address?.trim() || null,
      city: city,
      state: state,
      latitude: parseFloat(record.latitude) ?? 0,
      longitude: parseFloat(record.longitude) ?? 0,
      rating: parseFloat(record.rating) ?? 0,
      website: record.website?.trim() || null,
      place_link: record.place_link?.trim() || null,
      types: record.types?.trim() || null,
      price_level: record.price_level?.trim() || null,
      timezone: record.timezone?.trim() || null,
      working_hours: record.working_hours?.trim() || null
    };

    records.push(magician);
  }

  console.log(`Processed ${records.length} records`);

  // Insert into Supabase
  for (const record of records) {
    try {
      // First, insert the magician
      const { data: magicianData, error: magicianError } = await supabase
        .from('magicians')
        .upsert({
          name: record.name,
          business_name: record.name, // Using name as business name
          email: null,
          phone: record.phone_number,
          website_url: record.website,
          description: null,
          price_range_min: record.price_level ? parseFloat(record.price_level) * 100 : null,
          price_range_max: record.price_level ? parseFloat(record.price_level) * 300 : null,
          rating: record.rating,
          review_count: 0,
          verified: false,
        })
        .select()
        .single();

      if (magicianError) {
        console.error('Error inserting magician:', magicianError);
        continue;
      }

      // Then insert the location
      const { error: locationError } = await supabase
        .from('magician_locations')
        .upsert({
          magician_id: magicianData.id,
          address_line1: record.full_address,
          city: record.city,
          state: record.state,
          latitude: record.latitude,
          longitude: record.longitude,
          service_radius_miles: 50,
          is_primary: true
        });

      if (locationError) {
        console.error('Error inserting location:', locationError);
        continue;
      }

      // Map Google Places types to our specialty types
      if (record.types) {
        const typeMap: Record<string, SpecialtyType> = {
          'magician': 'Stage Magic',
          'close_up_magician': 'Close-up Magic',
          'mentalist': 'Mentalism',
          'childrens_entertainer': 'Children\'s Magic',
          'comedy_magician': 'Comedy Magic',
          'illusionist': 'Illusions',
          'card_magician': 'Card Magic',
          'street_magician': 'Street Magic',
          'corporate_entertainer': 'Corporate Magic'
        };

        const types = record.types.toLowerCase().split(';').map(t => t.trim());
        const specialties = new Set<SpecialtyType>();

        // Map Google Places types to our specialty types
        for (const type of types) {
          const mappedType = typeMap[type];
          if (mappedType) {
            specialties.add(mappedType);
          }
        }

        // Insert specialties
        for (const specialty of specialties) {
          const { error: specialtyError } = await supabase
            .from('magician_specialties')
            .upsert({
              magician_id: magicianData.id,
              specialty: specialty
            }, {
              onConflict: 'magician_id,specialty'
            });

          if (specialtyError) {
            console.error('Error inserting specialty:', specialtyError);
          }
        }
      }

      // Insert default availability
      const { error: availabilityError } = await supabase
        .from('magician_availability')
        .upsert({
          magician_id: magicianData.id,
          availability: 'By Appointment'
        });

      if (availabilityError) {
        console.error('Error inserting availability:', availabilityError);
      }

      console.log(`Successfully processed magician: ${record.name}`);
    } catch (error) {
      console.error('Error processing record:', error);
    }
  }
}

processCSV().catch(console.error);
