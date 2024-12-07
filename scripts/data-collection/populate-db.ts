import { sql } from '@vercel/postgres';
import { readFile } from 'fs/promises';
import path from 'path';
import { createMagiciansTable } from '@/lib/db/schema';
import { Magician } from '@/lib/db/schema';

async function populateDatabase() {
  try {
    // Create tables if they don't exist
    await createMagiciansTable();

    // Read processed data
    const dataPath = path.join(__dirname, '../../data/processed-listings.json');
    const rawData = await readFile(dataPath, 'utf-8');
    const magicians = JSON.parse(rawData) as Magician[];

    console.log(`Importing ${magicians.length} magicians...`);

    // Insert magicians in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < magicians.length; i += BATCH_SIZE) {
      const batch = magicians.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (magician: Magician) => {
          await sql`
            INSERT INTO magicians (
              name,
              business_name,
              city,
              state,
              latitude,
              longitude,
              website,
              phone,
              email,
              description,
              services,
              rating,
              review_count,
              image_url,
              social_media,
              created_at,
              updated_at
            ) VALUES (
              ${magician.name},
              ${magician.businessName || null},
              ${magician.city},
              ${magician.state},
              ${magician.latitude || null},
              ${magician.longitude || null},
              ${magician.website || null},
              ${magician.phone || null},
              ${magician.email || null},
              ${magician.description || null},
              ${JSON.stringify(magician.services)},
              ${magician.rating || null},
              ${magician.reviewCount || null},
              ${magician.imageUrl || null},
              ${magician.socialMedia ? JSON.stringify(magician.socialMedia) : null},
              ${(magician.createdAt || new Date()).toISOString()},
              ${(magician.updatedAt || new Date()).toISOString()}
            )
          `;
        })
      );

      console.log(`Imported ${i + batch.length} of ${magicians.length} magicians`);
    }

    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

// Run the script
populateDatabase();
