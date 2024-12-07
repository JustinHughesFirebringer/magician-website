import { sql } from '@vercel/postgres';
import { createMagiciansTable } from '../src/lib/db/schema';

const sampleMagicians = [
  {
    name: "David Mysterio",
    businessName: "Mysterio Magic Entertainment",
    city: "San Francisco",
    state: "CA",
    latitude: 37.7749,
    longitude: -122.4194,
    website: "https://example.com/mysterio",
    phone: "415-555-0123",
    email: "david@mysteriomagic.com",
    description: "With over 15 years of experience, David Mysterio specializes in mind-bending close-up magic and mentalism that will leave your guests speechless.",
    services: "{Close-up Magic,Card Magic,Mentalism}",
    rating: 4.8,
    reviewCount: 127,
    imageUrl: "https://images.unsplash.com/photo-1542200843-f8ee535f631f",
    socialMedia: {
      facebook: "https://facebook.com/mysteriomagic",
      instagram: "https://instagram.com/mysteriomagic",
      youtube: "https://youtube.com/mysteriomagic"
    }
  },
  {
    name: "Luna Wonder",
    businessName: "Luna Wonder Productions",
    city: "Las Vegas",
    state: "NV",
    latitude: 36.1699,
    longitude: -115.1398,
    website: "https://example.com/lunawonder",
    phone: "702-555-0123",
    email: "luna@wondermagic.com",
    description: "Luna Wonder brings the impossible to life with spectacular stage illusions and breathtaking levitations that will amaze audiences of all sizes.",
    services: "{Stage Magic,Levitation,Grand Illusions}",
    rating: 4.9,
    reviewCount: 243,
    imageUrl: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4",
    socialMedia: {
      facebook: "https://facebook.com/lunawonder",
      instagram: "https://instagram.com/lunawonder",
      twitter: "https://twitter.com/lunawonder"
    }
  },
  {
    name: "Professor Whimsy",
    businessName: "Whimsy's Wonder Workshop",
    city: "Boston",
    state: "MA",
    latitude: 42.3601,
    longitude: -71.0589,
    website: "https://example.com/profwhimsy",
    phone: "617-555-0123",
    email: "prof@whimsymagic.com",
    description: "Professor Whimsy brings joy and wonder to children's parties with a perfect blend of magic, comedy, and educational entertainment.",
    services: "{Children's Magic,Comedy Magic,Balloon Art}",
    rating: 4.7,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205",
    socialMedia: {
      facebook: "https://facebook.com/profwhimsy",
      instagram: "https://instagram.com/profwhimsy"
    }
  }
];

async function initializeDatabase() {
  try {
    // Create tables
    await createMagiciansTable();

    // Clear existing data
    await sql`TRUNCATE TABLE magicians`;

    // Insert sample magicians
    for (const magician of sampleMagicians) {
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
          social_media
        ) VALUES (
          ${magician.name},
          ${magician.businessName},
          ${magician.city},
          ${magician.state},
          ${magician.latitude},
          ${magician.longitude},
          ${magician.website},
          ${magician.phone},
          ${magician.email},
          ${magician.description},
          ${magician.services},
          ${magician.rating},
          ${magician.reviewCount},
          ${magician.imageUrl},
          ${JSON.stringify(magician.socialMedia)}
        )
      `;
    }

    console.log('Database initialized successfully with sample data');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

initializeDatabase()
  .catch(console.error)
  .finally(() => process.exit());
