'use client';

import React, { useState, useEffect } from 'react';
import { searchMagicians } from '@/lib/api/magicians';
import type { Database } from '@/types/supabase';

type Magician = Database['public']['Tables']['magicians']['Row'];

interface MagiciansSearchProps {
  query?: string;
  city?: string;
  state?: string;
}

export default function MagiciansSearch({ query, city, state }: MagiciansSearchProps) {
  const [magicians, setMagicians] = useState<Magician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMagicians() {
      try {
        setLoading(true);
        setError(null);
        const results = await searchMagicians(query, city, state);
        setMagicians(results);
      } catch (err) {
        setError('Failed to fetch magicians');
        console.error('Error fetching magicians:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMagicians();
  }, [query, city, state]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  if (magicians.length === 0) {
    return (
      <div className="text-center py-8">
        No magicians found for your search criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {magicians.map((magician) => (
        <div
          key={magician.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          {magician.photo_1 && (
            <img
              src={magician.photo_1}
              alt={magician.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{magician.name}</h3>
            <p className="text-gray-600 mb-2">
              {magician.city}, {magician.state}
            </p>
            {magician.description && (
              <p className="text-gray-700 text-sm mb-2">{magician.description}</p>
            )}
            {magician.price_range_min && magician.price_range_max && (
              <p className="text-sm text-gray-600">
                Price Range: ${magician.price_range_min} - ${magician.price_range_max}
              </p>
            )}
            {magician.rating && (
              <div className="flex items-center mt-2">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-gray-700">
                  {magician.rating.toFixed(1)}
                  {magician.review_count && ` (${magician.review_count} reviews)`}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
