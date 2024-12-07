import { Search, SlidersHorizontal } from 'lucide-react';
import MagicianCard from '@/components/MagicianCard';
import FilterSidebar from '@/components/FilterSidebar';
import { searchMagicians, getFilterData } from '@/lib/db/queries';
import type { Magician } from '@/types/magician';

export default async function MagiciansPage() {
  const { services, locations } = await getFilterData();
  const searchResults = await searchMagicians({});
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Search Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Find a Magician</h1>
            <button className="md:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow">
              <SlidersHorizontal size={20} />
              Filters
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, location, or specialty..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
