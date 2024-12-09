import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Clock, Globe } from 'lucide-react';
import { getMagicianBySlug } from '@/lib/db/queries';
import { Database } from '../../../types/database';

type Magician = Database['public']['Tables']['magicians']['Row'];

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const magician = await getMagicianBySlug(params.slug);

  if (!magician) {
    return {
      title: 'Magician Not Found',
      description: 'The requested magician profile could not be found.'
    };
  }

  return {
    title: `${magician.name} - Professional Magician`,
    description: magician.description || `Book ${magician.name} for your next event!`,
    openGraph: {
      title: `${magician.name} - Professional Magician`,
      description: magician.description || `Book ${magician.name} for your next event!`,
      images: magician.image_url ? [{ url: magician.image_url }] : undefined
    }
  };
}

export default async function MagicianPage({ params }: Props) {
  const magician = await getMagicianBySlug(params.slug);

  if (!magician) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Magician Finder
            </Link>
            <Link
              href="/search"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {magician.photo_1 && (
            <div className="relative h-96 w-full">
              <Image
                src={magician.photo_1}
                alt={magician.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {magician.name}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{magician.city}, {magician.state}</span>
                </div>

                {magician.rating && (
                  <div className="flex items-center text-gray-600">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    <span>{magician.rating.toFixed(1)} / 5.0</span>
                  </div>
                )}

                {magician.working_hours && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{magician.working_hours}</span>
                  </div>
                )}

                {magician.website_url && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-5 h-5 mr-2" />
                    <a
                      href={magician.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              <div>
                {magician.types && magician.types.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Specialties
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {magician.types.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {magician.bio && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      About
                    </h2>
                    <p className="text-gray-600">{magician.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
