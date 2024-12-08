import { SlidersHorizontal } from 'lucide-react';
import MagicianCard from '@/components/MagicianCard';
import FilterSidebar from '@/components/FilterSidebar';
import SearchForm from '@/components/SearchForm';
import { searchMagicians, getFilterData } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';

export default async function MagiciansPage() {
  const { services, locations } = await getFilterData();
  const searchResults = await searchMagicians({});
  
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Search Section */}
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

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden md:block">
            <FilterSidebar services={services} locations={locations} />
          </div>

          {/* Magician Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.magicians.map((magician) => (
                <MagicianCard key={magician.id} magician={magician} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
