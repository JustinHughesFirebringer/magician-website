import { Star, MapPin, Calendar, Clock, DollarSign, Globe, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getMagicianById } from '../../../lib/db/queries';
import { Magician } from '../../../types/magician';

export default async function MagicianProfile({ params }: { params: { id: string } }) {
  const magician = await getMagicianById(params.id) as Magician;

  if (!magician) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-64 w-full">
            <Image
              src={magician.image_url || '/placeholder-magician.jpg'}
              alt={magician.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{magician.name}</h1>
                {magician.business_name && (
                  <p className="text-xl text-gray-600 mb-2">{magician.business_name}</p>
                )}
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-1" />
                    {magician.locations[0].city}, {magician.locations[0].state}
                  </div>
                  {magician.rating && (
                    <div className="flex items-center">
                      <Star size={18} className="mr-1 text-yellow-400 fill-current" />
                      {magician.rating.toFixed(1)} ({magician.review_count} reviews)
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                  Contact Magician
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700 mb-6">{magician.description || 'No description available.'}</p>
              
              <h3 className="text-xl font-semibold mb-3">Services</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {magician.availability.map((service: string) => (
                  <span
                    key={service}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>

              {magician.website_url && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Globe size={18} />
                  <a href={magician.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    {magician.website_url}
                  </a>
                </div>
              )}
              {magician.social_media && Object.keys(magician.social_media).length > 0 && (
                <>
                  <h3 className="text-xl font-semibold mb-3">Social Media</h3>
                  <div className="flex gap-4">
                    {magician.social_media.facebook && (
                      <a
                        href={magician.social_media.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Facebook
                      </a>
                    )}
                    {magician.social_media.instagram && (
                      <a
                        href={magician.social_media.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800"
                      >
                        Instagram
                      </a>
                    )}
                    {magician.social_media.youtube && (
                      <a
                        href={magician.social_media.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800"
                      >
                        YouTube
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Based in {magician.locations[0].city}, {magician.locations[0].state}</span>
                </div>
                {magician.website_url && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={magician.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                {magician.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <a href={`tel:${magician.phone}`} className="text-gray-700">
                      {magician.phone}
                    </a>
                  </div>
                )}
                {magician.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <a href={`mailto:${magician.email}`} className="text-gray-700">
                      {magician.email}
                    </a>
                  </div>
                )}
              </div>
              <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">
                Request Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
