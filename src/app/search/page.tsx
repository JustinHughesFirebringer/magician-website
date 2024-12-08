import { Suspense } from 'react';
import Link from 'next/link';
import { getPopularServices, getLocations, searchMagicians, getFilterData } from '@/lib/db/queries';
import SearchForm from '@/components/SearchForm';
import MagicianList from '@/components/MagicianList';
import { SearchResults, FilterData } from '@/types/search';
import FilterSidebar from '@/components/FilterSidebar';

interface SearchPageProps {
  searchParams: {
    query?: string;
    state?: string;
    city?: string;
    service?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const [searchResults, filterData] = await Promise.all([
    searchMagicians({
      query: searchParams.query || '',
      state: searchParams.state || '',
      city: searchParams.city || '',
      service: searchParams.service || '',
      page,
    }),
    getFilterData()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Magician Finder
            </Link>
            <SearchForm 
              initialQuery={searchParams.query || ''} 
              initialState={searchParams.state || ''}
              initialCity={searchParams.city || ''}
              className="max-w-xl w-full"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <FilterSidebar 
            services={filterData.services}
            locations={filterData.locations}
            selectedState={searchParams.state}
            selectedCity={searchParams.city}
            selectedService={searchParams.service}
          />

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchResults.total} Magicians Found
              </h2>
              
              {/* Add filters/sort options here if needed */}
            </div>

            <Suspense fallback={<div>Loading magicians...</div>}>
              <MagicianList 
                magicians={searchResults.magicians}
                currentPage={page}
                totalPages={searchResults.totalPages}
              />
            </Suspense>

            {searchResults.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  {[...Array(searchResults.totalPages)].map((_, i) => {
                    const currentPage = i + 1;
                    const isCurrentPage = currentPage === page;
                    
                    // Create new URLSearchParams with current params
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', currentPage.toString());

                    return (
                      <Link
                        key={currentPage}
                        href={`/search?${params.toString()}`}
                        className={`px-3 py-2 rounded-md ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {currentPage}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
