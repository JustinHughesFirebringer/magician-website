'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Types
interface Magician {
  id: number;
  name: string;
  business_name: string | null;
  rating: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  magician_locations?: { city: string; state: string }[];
  locations: Location[];
}

interface Location {
  city: string;
  state: string;
}

export default function DirectoryPage() {
  const [magicians, setMagicians] = useState<Magician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMagicians, setFilteredMagicians] = useState<Magician[]>([]);

  useEffect(() => {
    const fetchMagicians = async () => {
      const { data: magiciansData, error: magiciansError } = await supabase
        .from('magicians')
        .select(`
          id,
          name,
          business_name,
          rating,
          price_range_min,
          price_range_max,
          magician_locations (
            city,
            state
          )
        `);

      if (magiciansError) {
        console.error('Error fetching magicians:', magiciansError);
        return;
      }

      const formattedMagicians = magiciansData.map((magician: Magician) => ({
        ...magician,
        locations: magician.magician_locations || []
      }));

      setMagicians(formattedMagicians);
      setFilteredMagicians(formattedMagicians);
      setLoading(false);
    };

    fetchMagicians();
  }, []);

  useEffect(() => {
    const filtered = magicians.filter((magician: Magician) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        magician.name.toLowerCase().includes(searchLower) ||
        (magician.business_name && magician.business_name.toLowerCase().includes(searchLower)) ||
        magician.locations.some(
          (location) =>
            location.city.toLowerCase().includes(searchLower) ||
            location.state.toLowerCase().includes(searchLower)
        )
      );
    });
    setFilteredMagicians(filtered);
  }, [searchTerm, magicians]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Magician Directory</h1>
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <Input
              type="text"
              placeholder="Search by name, business, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border-purple-500/50 text-white placeholder:text-purple-300/50 backdrop-blur-sm relative z-10 transition-all duration-300 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="w-full bg-black/20 backdrop-blur-sm border-purple-500/30 hover:border-pink-500/50 transition-all duration-500">
                <CardHeader className="space-y-2">
                  <div className="h-4 w-3/4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded"></div>
                  <div className="h-4 w-1/2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full mb-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded"></div>
                  <div className="h-4 w-2/3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMagicians.map((magician) => (
              <Card key={magician.id} className="group w-full bg-black/20 backdrop-blur-sm border-purple-500/30 hover:border-pink-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">{magician.name}</CardTitle>
                  {magician.business_name && (
                    <p className="text-purple-300/80">{magician.business_name}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {magician.rating && (
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-300/80">Rating:</span>
                        <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                          {magician.rating}/5
                        </div>
                      </div>
                    )}
                    {(magician.price_range_min || magician.price_range_max) && (
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-300/80">Price Range:</span>
                        <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20">
                          ${magician.price_range_min || '?'} - ${magician.price_range_max || '?'}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {magician.locations.map((location, index) => (
                        <div 
                          key={index} 
                          className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20"
                        >
                          {location.city}, {location.state}
                        </div>
                      ))}
                    </div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
