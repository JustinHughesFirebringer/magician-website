import { getLocations } from '@/lib/db/queries';
import LocationList from '@/components/LocationList';

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Magician Locations</h1>
      <LocationList locations={locations} />
    </main>
  );
}
