import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { DataValidator, MagicianListing } from './data-validator';
import { DataEnricher } from './data-enricher';

async function validateAndEnrichData() {
  try {
    // Load environment variables (you'll need to create these)
    const geocodingApiKey = process.env.GOOGLE_GEOCODING_API_KEY || '';
    const placesApiKey = process.env.GOOGLE_PLACES_API_KEY || '';

    // Initialize enricher
    const enricher = new DataEnricher(geocodingApiKey, placesApiKey);

    // Read the raw data file
    const dataPath = path.join(__dirname, '../../data/magician-listings.json');
    const rawData = await readFile(dataPath, 'utf-8');
    const listings: MagicianListing[] = JSON.parse(rawData);

    console.log(`Processing ${listings.length} listings...`);

    // Process each listing
    const processedListings: MagicianListing[] = [];
    const invalidListings: { listing: any; errors: string[] }[] = [];

    for (const listing of listings) {
      // Validate the listing
      const validation = DataValidator.validateListing(listing);
      
      if (validation.isValid) {
        // Enrich valid listings
        const enrichedListing = await enricher.enrichListing(listing);
        processedListings.push(enrichedListing);
        console.log(`✓ Processed: ${listing.name}`);
      } else {
        invalidListings.push({ listing, errors: validation.errors });
        console.log(`✗ Invalid: ${listing.name}`);
        console.log('  Errors:', validation.errors);
      }
    }

    // Save processed listings
    const processedPath = path.join(__dirname, '../../data/processed-listings.json');
    await writeFile(
      processedPath,
      JSON.stringify(processedListings, null, 2)
    );

    // Save invalid listings for review
    const invalidPath = path.join(__dirname, '../../data/invalid-listings.json');
    await writeFile(
      invalidPath,
      JSON.stringify(invalidListings, null, 2)
    );

    // Print summary
    console.log('\nProcessing Summary:');
    console.log(`Total listings: ${listings.length}`);
    console.log(`Valid listings: ${processedListings.length}`);
    console.log(`Invalid listings: ${invalidListings.length}`);
    console.log(`\nProcessed listings saved to: ${processedPath}`);
    console.log(`Invalid listings saved to: ${invalidPath}`);

  } catch (error) {
    console.error('Error processing data:', error);
    process.exit(1);
  }
}

// Run the script
validateAndEnrichData();
