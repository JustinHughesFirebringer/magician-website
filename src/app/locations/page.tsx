import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getLocations } from '../../lib/api/magicians';

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Magician Finder
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Find Magicians by Location
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map(({ state, cities }) => (
            <div 
              key={state}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-indigo-600 px-4 py-3">
                <h2 className="text-xl font-semibold text-white">
                  {state}
                </h2>
              </div>

              <div className="p-4">
                <ul className="space-y-2">
                  {cities.map((city) => (
                    <li key={`${state}-${city}`}>
                      <Link
                        href={`/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`}
                        className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {city}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {locations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No locations found. Please check back later.
          </div>
        )}
      </main>
    </div>
  );
}
