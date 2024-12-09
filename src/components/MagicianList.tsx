'use client';

import { Magician } from '../types/magician';
import Link from 'next/link';
import { Star, MapPin, Globe, Phone } from 'lucide-react';
import Image from 'next/image';
import ExternalLink from './ExternalLink';

interface MagicianListProps {
  magicians: Magician[];
  currentPage?: number;
  totalPages?: number;
}

export default function MagicianList({ magicians, currentPage, totalPages }: MagicianListProps) {
  if (magicians.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No magicians found</h3>
        <p className="mt-2 text-sm text-gray-500">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {magicians.map((magician) => (
          <Link
            key={magician.id}
            href={`/magicians/${magician.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="relative h-48">
              <Image
                src={magician.image_url || '/placeholder-magician.jpg'}
                alt={magician.name}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {magician.name}
              </h3>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{magician.locations[0].city}, {magician.locations[0].state}</span>
              </div>

              {magician.website_url && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Globe className="w-4 h-4 mr-1" />
                  <ExternalLink
                    href={magician.website_url}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Visit Website
                  </ExternalLink>
                </div>
              )}

              {magician.phone && (
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Phone className="w-4 h-4 mr-1" />
                  <ExternalLink
                    href={`tel:${magician.phone}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {magician.phone}
                  </ExternalLink>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {magician.availability.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {service}
                  </span>
                ))}
              </div>

              {magician.rating && (
                <div className="mt-3 flex items-center">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-600">
                    {magician.rating.toFixed(1)} ({magician.review_count} reviews)
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {totalPages && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isCurrentPage = page === currentPage;
              
              return (
                <Link
                  key={page}
                  href={{
                    pathname: '/search',
                    query: {
                      ...Object.fromEntries(new URLSearchParams(window.location.search)),
                      page: page.toString()
                    }
                  }}
                  className={`px-3 py-2 rounded-md ${
                    isCurrentPage
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
