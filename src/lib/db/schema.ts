import { sql } from '@vercel/postgres';
import { z } from 'zod';

export const MagicianSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  businessName: z.string().optional(),
  city: z.string(),
  state: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  description: z.string().optional(),
  services: z.array(z.string()),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  imageUrl: z.string().url().optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    youtube: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Magician = z.infer<typeof MagicianSchema>;

export async function createMagiciansTable() {
  try {
    await sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      CREATE TABLE IF NOT EXISTS magicians (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        "businessName" VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        latitude DECIMAL,
        longitude DECIMAL,
        website VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        description TEXT,
        services TEXT[],
        rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
        "reviewCount" INTEGER CHECK ("reviewCount" >= 0),
        "imageUrl" VARCHAR(255),
        "socialMedia" JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_magicians_location ON magicians(state, city);
      CREATE INDEX IF NOT EXISTS idx_magicians_services ON magicians USING GIN(services);
      CREATE INDEX IF NOT EXISTS idx_magicians_rating ON magicians(rating DESC NULLS LAST);
    `;
    
    console.log('Magicians table created successfully');
  } catch (error) {
    console.error('Error creating magicians table:', error);
    throw error;
  }
}
