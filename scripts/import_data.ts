import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use the Vercel environment variables directly
const supabaseUrl = "https://siukegkcregepkwqiora.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWtlZ2tjcmVnZXBrd3Fpb3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzYwOTgyNiwiZXhwIjoyMDQ5MTg1ODI2fQ.tV0smu1gE9gvIS2lmttRkuRd26dlyEGYIZoBo7L5Cx0";

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ScrapedMagician {
  id: string;
  name: string;
  services: string[];
  location: {
    city: string;
    state: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  };
  specialties: string[];
  experience_years?: number;
  rating?: number;
  reviews_count?: number;
}

interface ScrapedData {
  magicians: ScrapedMagician[];
  last_updated: string;
  total_count: number;
}

async function importData() {
  try {
    // First, clear existing data
    await supabase.from('magician_availability').delete().neq('magician_id', 0);
    await supabase.from('magician_specialties').delete().neq('magician_id', 0);
    await supabase.from('magician_locations').delete().neq('magician_id', 0);
    await supabase.from('reviews').delete().neq('magician_id', 0);
    await supabase.from('shows').delete().neq('magician_id', 0);
    await supabase.from('magicians').delete().neq('id', 0);

    // Read the scraped data
    const dataPath = path.join(process.cwd(), 'data', 'magicians.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data: ScrapedData = JSON.parse(rawData);

    for (const magician of data.magicians) {
      // Insert magician
      const { data: magicianData, error: magicianError } = await supabase
        .from('magicians')
        .insert({
          name: magician.name,
          email: magician.contact.email,
          phone: magician.contact.phone,
          website_url: magician.contact.website,
          rating: magician.rating,
          review_count: magician.reviews_count || 0,
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (magicianError) {
        console.error('Error inserting magician:', magicianError);
        continue;
      }

      const magicianId = magicianData.id;

      // Insert location
      if (magician.location) {
        const { error: locationError } = await supabase
          .from('magician_locations')
          .insert({
            magician_id: magicianId,
            city: magician.location.city,
            state: magician.location.state,
            latitude: magician.location.coordinates.latitude,
            longitude: magician.location.coordinates.longitude,
            is_primary: true
          });

        if (locationError) {
          console.error('Error inserting location:', locationError);
        }
      }

      // Insert specialties
      for (const specialty of magician.services) {
        const { error: specialtyError } = await supabase
          .from('magician_specialties')
          .insert({
            magician_id: magicianId,
            specialty: specialty
          });

        if (specialtyError) {
          console.error(`Error inserting specialty ${specialty}:`, specialtyError);
        }
      }

      // Set default availability
      const { error: availabilityError } = await supabase
        .from('magician_availability')
        .insert({
          magician_id: magicianId,
          availability: 'By Appointment'
        });

      if (availabilityError) {
        console.error('Error setting default availability:', availabilityError);
      }
    }

    console.log(`Successfully imported ${data.magicians.length} magicians`);
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

// Run the import
importData().catch(console.error);
