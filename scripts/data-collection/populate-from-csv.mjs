import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://siukegkcregepkwqiora.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWtlZ2tjcmVnZXBrd3Fpb3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzYwOTgyNiwiZXhwIjoyMDQ5MTg1ODI2fQ.tV0smu1gE9gvIS2lmttRkuRd26dlyEGYIZoBo7L5Cx0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function processCSV() {
  const records = [];
  const parser = createReadStream(path.join(process.cwd(), '500 - magicanus500.csv'))
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));

  for await (const record of parser) {
    // Skip if no name
    if (!record.name) {
      console.log('Skipping record: missing name');
      continue;
    }

    // Extract city and state
    const city = record.city?.split(',')[0]?.trim();
    const state = record.city?.split(',')[1]?.trim();

    // Skip if missing required location information
    if (!city || !state) {
      console.log(`Skipping record "${record.name}": missing city or state`);
      continue;
    }

    // Clean up the data
    const magician = {
      name: record.name.trim(),
      business_name: record.name.trim(), // Using name as business_name since that's what we have
      phone: record.phone_number?.replace(/\D/g, '') || null, // Remove non-digits
      website_url: record.website?.trim() || null,
      rating: parseFloat(record.rating) || null,
      // Estimate price range from price_level (assuming price_level is 1-4)
      price_range_min: record.price_level ? parseFloat(record.price_level) * 100 : null,
      price_range_max: record.price_level ? parseFloat(record.price_level) * 300 : null,
      verified: false, // Default to false for imported records
      description: null // We don't have this from Google Places
    };

    const location = {
      address_line1: record.full_address?.trim() || null,
      city,
      state,
      latitude: parseFloat(record.latitude) || null,
      longitude: parseFloat(record.longitude) || null,
      is_primary: true,
      service_radius_miles: 50 // Default value
    };

    records.push({ magician, location });
  }

  console.log(`Processed ${records.length} records`);

  // Insert into Supabase
  for (const record of records) {
    try {
      // First, insert the magician
      const { data: magicianData, error: magicianError } = await supabase
        .from('magicians')
        .upsert(record.magician)
        .select()
        .single();

      if (magicianError) {
        console.error('Error inserting magician:', {
          error: magicianError,
          record: record.magician
        });
        continue;
      }

      // Then insert the location
      const { error: locationError } = await supabase
        .from('magician_locations')
        .upsert({
          ...record.location,
          magician_id: magicianData.id
        });

      if (locationError) {
        console.error('Error inserting location:', {
          error: locationError,
          record: {
            ...record.location,
            magician_id: magicianData.id
          }
        });
        continue;
      }

      console.log(`Successfully processed magician: ${record.magician.name}`);
    } catch (error) {
      console.error('Unexpected error:', error);
      continue;
    }
  }
}

processCSV().catch(console.error);
