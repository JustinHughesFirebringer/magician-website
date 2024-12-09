import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';

const supabaseUrl = 'https://siukegkcregepkwqiora.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWtlZ2tjcmVnZXBrd3Fpb3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MDk4MjYsImV4cCI6MjA0OTE4NTgyNn0.MDuT_GbDGLqYmxj8FFLFc0fD1Z5gqcBIgtGG3yuzu0o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSlugField() {
  try {
    console.log('Starting slug migration...');

    // 1. First check if the column exists
    const { data: columnExists, error: checkError } = await supabase
      .from('magicians')
      .select('slug')
      .limit(1);

    if (checkError) {
      // If error is about missing column, we need to add it
      if (checkError.message.includes('column "slug" does not exist')) {
        console.log('Slug column does not exist. Adding it...');
        
        // Add the slug column using raw SQL
        const { error: alterError } = await supabase.rpc('add_slug_column', {
          table_name: 'magicians',
          column_name: 'slug'
        });

        if (alterError) {
          console.error('Error adding slug column:', alterError);
          throw alterError;
        }
        console.log('Successfully added slug column');
      } else {
        console.error('Error checking slug column:', checkError);
        throw checkError;
      }
    } else {
      console.log('Slug column already exists');
    }

    // 2. Get all magicians without slugs
    console.log('Fetching magicians without slugs...');
    const { data: magicians, error: fetchError } = await supabase
      .from('magicians')
      .select('id, name, business_name')
      .is('slug', null);

    if (fetchError) {
      console.error('Error fetching magicians:', fetchError);
      throw fetchError;
    }

    if (!magicians?.length) {
      console.log('No magicians found needing slug updates');
      return;
    }

    console.log(`Found ${magicians.length} magicians needing slug updates`);

    // 3. Generate and update slugs
    for (const magician of magicians) {
      try {
        const baseName = magician.business_name || magician.name;
        let slug = slugify(baseName, { lower: true, strict: true });
        let counter = 0;
        let finalSlug = slug;

        console.log(`Processing magician ${magician.id} with base slug: ${slug}`);

        // Check if slug exists and append number if needed
        while (true) {
          const { data: existing, error: checkError } = await supabase
            .from('magicians')
            .select('id')
            .eq('slug', finalSlug)
            .single();

          if (checkError?.code === 'PGRST116') break; // No match found
          if (checkError) {
            console.error(`Error checking slug existence for ${finalSlug}:`, checkError);
            throw checkError;
          }
          
          counter++;
          finalSlug = `${slug}-${counter}`;
          console.log(`Slug ${slug} exists, trying ${finalSlug}`);
        }

        // Update the magician with the unique slug
        const { error: updateError } = await supabase
          .from('magicians')
          .update({ slug: finalSlug })
          .eq('id', magician.id);

        if (updateError) {
          console.error(`Error updating magician ${magician.id}:`, updateError);
          throw updateError;
        }
        console.log(`Updated magician ${magician.id} with slug: ${finalSlug}`);
      } catch (error) {
        console.error(`Error processing magician ${magician.id}:`, error);
        throw error;
      }
    }

    console.log('Slug migration completed successfully');
  } catch (error) {
    console.error('Error in slug migration:', error);
    throw error;
  }
}

export default addSlugField;
