'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient, createQueryBuilder } from '@/lib/supabase/client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from '@/lib/hooks/useDebounce';

// Types
interface Magician {
  id: number;
  name: string;
  business_name: string | null;
  rating: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  locations: Location[];
}

interface Location {
  city: string;
  state: string;
  slug: string;
}

interface SearchSuggestion {
  city: string;
  state: string;
  slug: string;
  similarity: number;
  magician_count: number;
}

export default function DirectoryPage() {
  const [magicians, setMagicians] = useState<Magician[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<SearchSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsTyping(true);
    
    // Clear typing state after debounce delay
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 300);
    
    return () => clearTimeout(timer);
  };

  const searchMagicians = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      // Don't search if query is too short
      if (query.length > 0 && query.length < 2) {
        setMagicians([]);
        setLocationSuggestions([]);
        setError('Please enter at least 2 characters to search');
        return;
      }

      // First try to find location matches using the operations wrapper
      const locationMatches = await createClient().rpc('search_magician_locations', {
        search_term: query.toLowerCase(),
        similarity_threshold: 0.3
      });

      setLocationSuggestions(locationMatches || []);

      // Search for magicians using the type-safe query builder
      const magicianQuery = createQueryBuilder('magicians')
        .select(`
          *,
          magician_locations (
            city,
            state,
            slug
          )
        `)
        .or(query ? `
          name.ilike.%${query}%,
          business_name.ilike.%${query}%,
          magician_locations.city.ilike.%${query}%,
          magician_locations.state.ilike.%${query}%
        ` : 'id.gt.0')
        .limit(50);

      const magicianData = await magicianQuery.execute();

      if (magicianData) {
        const formattedData = magicianData.data.map(magician => ({
          ...magician,
          locations: magician.magician_locations || []
        }));
        setMagicians(formattedData);
      }
    } catch (err) {
      console.error('Error searching magicians:', err);
      setError(err instanceof Error ? err.message : 'Failed to search magicians. Please try again.');
      setMagicians([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    searchMagicians('');
  }, [searchMagicians]);

  // Search when term changes
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      searchMagicians(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchMagicians]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Magician Directory
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name, business, or location..."
                value={searchTerm}
                onChange={handleSearchInput}
                className="w-full bg-black/20 border-purple-500/50 text-white placeholder:text-purple-300/50 backdrop-blur-sm relative z-10 transition-all duration-300 focus:border-pink-500 focus:ring-pink-500"
              />
              {isTyping && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50">
                  Typing...
                </div>
              )}
            </div>
          </div>

          {/* Search Feedback */}
          {searchTerm.length === 1 && (
            <div className="mt-2 text-sm text-purple-300/70">
              Please enter at least 2 characters to search
            </div>
          )}

          {/* Location Suggestions */}
          {locationSuggestions.length > 0 && searchTerm && (
            <div className="mt-4 max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-sm font-medium text-purple-300 mb-2">Location Matches:</h3>
              <div className="flex flex-wrap gap-2">
                {locationSuggestions.map((suggestion) => (
                  <Link
                    key={suggestion.slug}
                    href={`/magicians/${suggestion.slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 hover:bg-pink-500/30 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300"
                  >
                    <span>{suggestion.city}, {suggestion.state}</span>
                    <span className="ml-2 text-xs text-purple-300">
                      ({suggestion.magician_count})
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-white">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : magicians.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No magicians found</h2>
            <p className="text-purple-300">Try adjusting your search terms or browse all locations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {magicians.map((magician) => (
              <Link key={magician.id} href={`/magicians/${magician.id}`}>
                <Card className="group w-full bg-black/20 backdrop-blur-sm border-purple-500/30 hover:border-pink-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                      {magician.business_name || magician.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {magician.locations.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-300/80">Locations:</span>
                          <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                            {magician.locations.map(loc => `${loc.city}, ${loc.state}`).join(' | ')}
                          </div>
                        </div>
                      )}
                      {magician.price_range_min && magician.price_range_max && (
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-300/80">Price Range:</span>
                          <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                            ${magician.price_range_min} - ${magician.price_range_max}
                          </div>
                        </div>
                      )}
                      {magician.rating && (
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-300/80">Rating:</span>
                          <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                            {magician.rating}/5
                          </div>
                        </div>
                      )}
                      <Link href={`/magicians/${magician.id}`} className="block mt-6">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-pink-500/50 text-white hover:text-pink-400 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-purple-500/20"
                        >
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
