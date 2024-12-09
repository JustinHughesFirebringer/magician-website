import { SlidersHorizontal } from 'lucide-react';
import MagicianCard from '@/components/MagicianCard';
import FilterSidebar from '@/components/FilterSidebar';
import SearchForm from '@/components/SearchForm';
import { searchMagicians, getFilterData } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function PageLayout({ children, services, locations }: { 
  children: React.ReactNode;
  services?: string[];
  locations?: { city: string; state: string; }[];
}) {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Find a Magician</h1>
            <Button variant="outline" className="md:hidden flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
          <SearchForm />
        </div>

        <div className="flex gap-8">
          <div className="hidden md:block">
            {services && locations && (
              <FilterSidebar services={services} locations={locations} />
            )}
          </div>
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function MagiciansPage() {
  console.log('[Server] Fetching magician data...');
  const startTime = Date.now();

  try {
    // Fetch data with timeout protection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const dataPromise = Promise.all([
      getFilterData(),
      searchMagicians({})
    ]);

    const [filterData, searchResults] = await Promise.race([dataPromise, timeoutPromise]) as [
      { services: string[]; locations: { city: string; state: string; }[] },
      { magicians: any[]; total: number }
    ];

    const { services, locations } = filterData;

    console.log('[Server] Data fetched:', {
      duration: Date.now() - startTime,
      magiciansCount: searchResults.magicians?.length ?? 0,
      servicesCount: services?.length ?? 0,
      locationsCount: locations?.length ?? 0
    });

    // Validate data integrity
    if (!Array.isArray(searchResults.magicians)) {
      throw new Error('Invalid magicians data structure');
    }

    // Handle empty results
    if (!searchResults.magicians.length) {
      return (
        <PageLayout services={services} locations={locations}>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-foreground">No magicians found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search criteria or check back later.
            </p>
          </div>
        </PageLayout>
      );
    }

    // Render results
    return (
      <PageLayout services={services} locations={locations}>
        <div className="mb-4 text-sm text-muted-foreground">
          Found {searchResults.total} magician{searchResults.total !== 1 ? 's' : ''}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.magicians.map((magician) => (
            magician && magician.id ? (
              <MagicianCard key={magician.id} magician={magician} />
            ) : null
          ))}
        </div>
      </PageLayout>
    );

  } catch (error) {
    console.error('[Server] Error fetching magician data:', error);
    
    return (
      <PageLayout services={[]} locations={[]}>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground">
            {error instanceof Error && error.message === 'Request timeout'
              ? 'Request timed out'
              : 'Error loading magicians'}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error 
              ? error.message === 'Request timeout'
                ? 'The server is taking too long to respond. Please try again.'
                : error.message
              : 'Please try again later.'}
          </p>
        </div>
      </PageLayout>
    );
  }
}
