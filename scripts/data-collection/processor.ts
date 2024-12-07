import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Validation schema
const MagicianSchema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional(),
  location: z.object({
    city: z.string(),
    state: z.string().length(2),
  }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).nullable(),
  source: z.string(),
  sourceUrl: z.string().url(),
});

type ValidatedMagician = z.infer<typeof MagicianSchema>;

// Database connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE,
});

async function processAndInsertData() {
  try {
    // Read collected data
    const dataPath = path.join(__dirname, '../../src/data/collected-magicians.json');
    const rawData = JSON.parse(await readFile(dataPath, 'utf-8'));

    // Validate and clean data
    const validatedData: ValidatedMagician[] = [];
    for (const item of rawData) {
      try {
        const validated = MagicianSchema.parse(item);
        validatedData.push(validated);
      } catch (error) {
        console.error(`Validation error for magician ${item.name}:`, error);
      }
    }

    // Begin database transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const magician of validatedData) {
        // Insert magician
        const magicianResult = await client.query(
          `INSERT INTO magicians (
            name, 
            website_url,
            rating,
            review_count,
            price_range_min,
            price_range_max
          ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            magician.name,
            magician.website,
            0, // Initial rating
            0, // Initial review count
            250, // Default minimum price
            1000, // Default maximum price
          ]
        );

        const magicianId = magicianResult.rows[0].id;

        // Insert location
        if (magician.coordinates) {
          await client.query(
            `INSERT INTO magician_locations (
              magician_id,
              city,
              state,
              location
            ) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))`,
            [
              magicianId,
              magician.location.city,
              magician.location.state,
              magician.coordinates.lng,
              magician.coordinates.lat,
            ]
          );
        }

        // Insert default specialty
        await client.query(
          `INSERT INTO magician_specialties (magician_id, specialty)
           VALUES ($1, $2)`,
          [magicianId, 'Stage Magic']
        );

        // Insert default availability
        await client.query(
          `INSERT INTO magician_availability (magician_id, availability)
           VALUES ($1, $2)`,
          [magicianId, 'By Appointment']
        );
      }

      await client.query('COMMIT');
      console.log(`Successfully processed and inserted ${validatedData.length} magicians`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing data:', error);
  } finally {
    await pool.end();
  }
}

// Add data enrichment functions
async function enrichMagicianData(magicianId: number) {
  // TODO: Implement additional data enrichment
  // - Fetch reviews from various platforms
  // - Get social media presence
  // - Verify business information
  // - Get performance videos/photos
}

processAndInsertData();
