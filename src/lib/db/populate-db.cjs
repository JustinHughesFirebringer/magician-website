require('dotenv').config(); // Load environment variables from .env file
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables for Supabase');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populateDatabase() {
  const { data, error } = await supabase
    .from('magicians') // Correct table name
    .insert([
      {
        name: 'The Great Magician',
        business_name: 'Magic Co.',
        email: 'info@magicco.com',
        phone: '123-456-7890',
        website_url: 'https://example.com',
        description: 'A fantastic magician with years of experience.',
        price_range_min: 500.00,
        price_range_max: 1500.00,
        rating: 4.5,
        review_count: 100,
        verified: true,
      },
    ]);

  if (error) {
    console.error('Error populating database:', error.message); // Log detailed error message
  } else {
    console.log('Database populated successfully:', data);
  }
}

populateDatabase();
