import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function populateDatabase() {
  try {
    // Read raw listings
    const dataPath = join(__dirname, '../../data/raw-listings.json');
    const rawData = await readFile(dataPath, 'utf-8');
    const listings = JSON.parse(rawData);

    console.log(`Importing ${listings.length} magicians...`);

    // Insert magicians in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < listings.length; i += BATCH_SIZE) {
      const batch = listings.slice(i, i + BATCH_SIZE);
      
      for (const listing of batch) {
        // Insert magician
        const { data: magicianData, error: magicianError } = await supabase
          .from('magicians')
          .insert({
            name: listing.name,
            business_name: listing.businessName,
            email: listing.email,
            phone: listing.phone,
            website_url: listing.website,
            bio: listing.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (magicianError) {
          console.error('Error inserting magician:', magicianError);
          continue;
        }

        // Insert location
        const { error: locationError } = await supabase
          .from('magician_locations')
          .insert({
            magician_id: magicianData.id,
            city: listing.location.city,
            state: listing.location.state,
            latitude: listing.location.latitude || 0,
            longitude: listing.location.longitude || 0,
            service_radius_miles: 50,  // Default to 50 miles
            is_primary: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (locationError) {
          console.error('Error inserting location:', locationError);
        }

        // Insert default availability (By Appointment)
        const { error: availabilityError } = await supabase
          .from('magician_availability')
          .insert({
            magician_id: magicianData.id,
            availability: 'By Appointment',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (availabilityError) {
          console.error('Error inserting availability:', availabilityError);
        }
      }

      console.log(`Imported ${i + batch.length} of ${listings.length} magicians`);
    }

    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

// Run the script
populateDatabase();
