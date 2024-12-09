const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing environment variables for Supabase');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function populateDatabase() {
  const { data, error } = await supabase
    .from('your_table_name') // Replace with your actual table name
    .insert([
      { column1: 'value1', column2: 'value2' }, // Replace with actual columns and values
    ]);

  if (error) {
    console.error('Error populating database:', error);
  } else {
    console.log('Database populated successfully:', data);
  }
}

populateDatabase();
