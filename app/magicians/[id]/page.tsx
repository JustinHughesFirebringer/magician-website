'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PhoneIcon, 
  Globe, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign 
} from 'lucide-react';

// Types
interface Magician {
  id: number;
  name: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  description: string | null;
  price_range_min: number | null;
  price_range_max: number | null;
  rating: number | null;
  review_count: number;
  verified: boolean;
  locations: Location[];
  reviews: Review[];
  shows: Show[];
}

interface Location {
  id: number;
  address_line1: string | null;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  service_radius_miles: number;
}

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  review_text: string | null;
  event_date: string | null;
}

interface Show {
  id: number;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  base_price: number | null;
  max_audience_size: number | null;
}

export default function MagicianPage({ params }: { params: { id: string } }) {
  const [magician, setMagician] = useState<Magician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMagician = async () => {
      const { data: magicianData, error: magicianError } = await supabase
        .from('magicians')
        .select(`
          *,
          magician_locations (*),
          reviews (*),
          shows (*)
        `)
        .eq('id', params.id)
        .single();

      if (magicianError) {
        console.error('Error fetching magician:', magicianError);
        notFound();
        return;
      }

      setMagician(magicianData);
      setLoading(false);
    };

    fetchMagician();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="h-8 w-[300px] bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-[250px] bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-[150px] bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!magician) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-12">
      <div className="space-y-8">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">{magician.name}</CardTitle>
                {magician.business_name && magician.business_name !== magician.name && (
                  <p className="text-muted-foreground">{magician.business_name}</p>
                )}
              </div>
              {magician.verified && (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                  Verified
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {magician.phone && (
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{magician.phone}</span>
                </div>
              )}
              {magician.website_url && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={magician.website_url} 
                    className="text-primary hover:underline"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              {magician && magician.locations && magician.locations.length > 0 && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {magician.locations[0].city}, {magician.locations[0].state}
                  </span>
                </div>
              )}
              {magician.rating && (
                <div className="flex items-center space-x-2">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                    ★ {magician.rating.toFixed(1)}
                    {magician.review_count > 0 && ` (${magician.review_count} reviews)`}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shows */}
        {magician.shows && magician.shows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Shows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {magician.shows.map((show) => (
                <div key={show.id} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{show.title}</h3>
                    {show.description && (
                      <p className="text-muted-foreground mt-1">{show.description}</p>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {show.duration_minutes && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{show.duration_minutes} minutes</span>
                      </div>
                    )}
                    {show.max_audience_size && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Up to {show.max_audience_size} people</span>
                      </div>
                    )}
                    {show.base_price && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Starting at ${show.base_price}</span>
                      </div>
                    )}
                  </div>
                  <div className="h-px bg-border my-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {magician.reviews && magician.reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {magician.reviews.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="font-medium">{review.reviewer_name}</span>
                    </div>
                    {review.event_date && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.event_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {review.review_text && (
                    <p className="text-muted-foreground">{review.review_text}</p>
                  )}
                  <div className="h-px bg-border my-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
