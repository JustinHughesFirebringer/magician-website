import { Suspense } from 'react';
import Link from 'next/link';
import { getMagiciansByLocation } from '@/lib/api/magicians';
import SearchForm from '@/components/SearchForm';
import MagicianList from '@/components/MagicianList';

interface SearchPageProps {
  searchParams: {
    city?: string;
    state?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  console.log('Search Page Params:', searchParams);

  try {
    const { city, state } = searchParams;

    if (!city || !state) {
      return (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                  Magician Finder
                </Link>
                <SearchForm 
                  initialCity={city || ''} 
                  initialState={state || ''}
                />
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Please select a city and state to find magicians
              </h2>
            </div>
          </main>
        </div>
      );
    }

    const magicians = await getMagiciansByLocation(city, state);
    console.log('Found magicians:', magicians.length);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Magician Finder
              </Link>
              <SearchForm 
                initialCity={city} 
                initialState={state}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              {magicians.length > 0 
                ? `Found ${magicians.length} magicians in ${city}, ${state}`
                : `No magicians found in ${city}, ${state}`
              }
            </h2>
          </div>

          <Suspense fallback={<div>Loading magicians...</div>}>
            <MagicianList magicians={magicians} />
          </Suspense>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Search Page Error:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Magician Finder
              </Link>
              <SearchForm 
                initialCity={searchParams.city || ''} 
                initialState={searchParams.state || ''}
              />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Results</h2>
            <p className="text-gray-600">
              We encountered an error while loading the search results. Please try again later.
            </p>
          </div>
        </main>
      </div>
    );
  }
}
