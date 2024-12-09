'use client';

import { FilterData } from '../types/search';
import Link from 'next/link';

interface LocationListProps {
  locations: FilterData['locations'];
}

export default function LocationList({ locations }: LocationListProps) {
  // Group locations by state
  const locationsByState = locations.reduce((acc: Record<string, typeof locations>, location: FilterData['locations'][0]) => {
    if (!acc[location.state]) {
      acc[location.state] = [];
    }
    acc[location.state].push(location);
    return acc;
  }, {} as Record<string, typeof locations>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Object.entries(locationsByState).map(([state, cities]) => (
        <div key={state} className="bg-card rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-card-foreground">{state}</h2>
          <ul className="space-y-2">
            {cities.map((city) => (
              <li key={`${city.state}-${city.city}`}>
                <Link
                  href={`/search?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city.city)}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {city.city} ({city.magicianCount} magicians)
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
