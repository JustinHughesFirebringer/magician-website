'use client';

import { MapPin, Star, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Database } from '../types/database';

type Magician = Database['public']['Tables']['magicians']['Row'];

interface MagicianListProps {
  magicians: Magician[];
}

export default function MagicianList({ magicians }: MagicianListProps) {
  if (!magicians || magicians.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No magicians found in this location.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {magicians.map((magician) => (
        <Link 
          key={magician.id}
          href={`/magicians/${magician.slug}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {magician.photo_1 && (
            <div className="relative h-48 w-full">
              <Image
                src={magician.photo_1}
                alt={magician.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {magician.name}
            </h3>
            
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{magician.city}, {magician.state}</span>
            </div>

            {magician.rating && (
              <div className="flex items-center text-gray-600 mb-2">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                <span>{magician.rating.toFixed(1)} / 5.0</span>
              </div>
            )}

            {magician.working_hours && (
              <div className="flex items-center text-gray-600 mb-4">
                <Clock className="w-4 h-4 mr-1" />
                <span>{magician.working_hours}</span>
              </div>
            )}

            {magician.types && magician.types.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {magician.types.map((type) => (
                  <span 
                    key={type}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
