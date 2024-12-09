'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Wand2 } from 'lucide-react';

interface FilterSidebarProps {
  services: { service: string; count: number }[];
  locations: { state: string; city: string; magicianCount: number }[];
  selectedService?: string;
  selectedState?: string;
  selectedCity?: string;
}

export default function FilterSidebar({ 
  services, 
  locations, 
  selectedService = '',
  selectedState = '',
  selectedCity = ''
}: FilterSidebarProps) {
  const router = useRouter();
  const params = useSearchParams();

  const handleServiceChange = (service: string) => {
    const searchParams = new URLSearchParams(params?.toString() ?? '');
    if (service) {
      searchParams.set('service', service);
    } else {
      searchParams.delete('service');
    }
    searchParams.delete('page'); // Reset page when changing filters
    router.push(`/search?${searchParams.toString()}`);
  };

  const handleLocationChange = (state: string, city: string) => {
    const searchParams = new URLSearchParams(params?.toString() ?? '');
    if (state && city) {
      searchParams.set('state', state);
      searchParams.set('city', city);
    } else {
      searchParams.delete('state');
      searchParams.delete('city');
    }
    searchParams.delete('page'); // Reset page when changing filters
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <aside className="w-64 bg-white rounded-lg shadow p-6">
      {/* Services Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Wand2 className="w-5 h-5 mr-2" />
          Services
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => handleServiceChange('')}
            className={`w-full text-left px-3 py-2 rounded-md ${
              !selectedService
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Services
          </button>
          {services.map(({ service, count }) => (
            <button
              key={service}
              onClick={() => handleServiceChange(service)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                selectedService === service
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {service} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Locations Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Locations
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => handleLocationChange('', '')}
            className={`w-full text-left px-3 py-2 rounded-md ${
              !selectedState && !selectedCity
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Locations
          </button>
          {locations.map(({ state, city, magicianCount }) => (
            <button
              key={`${state}-${city}`}
              onClick={() => handleLocationChange(state, city)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                selectedState === state && selectedCity === city
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {city}, {state} ({magicianCount})
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

