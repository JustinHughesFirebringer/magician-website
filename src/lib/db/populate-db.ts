import { supabase } from '@/lib/supabase'; // Updated path
// Placeholder for Database type
type Database = {
  // Define your table structure here
  your_table_name: {
    column1: string;
    column2: string;
    // Add other columns as needed
  };
};

async function populateDatabase() {
  // Example data to insert
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

