import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import MagicianCard from '../../components/MagicianCard';

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
}

interface Magician {
  id: string;
  name: string;
  business_name?: string;
  email?: string;
  phone?: string;
  website_url?: string;
  description?: string;
  price_range_min?: number;
  price_range_max?: number;
  rating?: number;
  review_count?: number;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
  socialMedia?: SocialMedia; // Added social media property
  city?: string; // Added city property
  state?: string; // Added state property
  services?: string[]; // Added services property
  imageUrl?: string; // Added imageUrl property
}

const LocationPage = () => {
  const router = useRouter();
  const { location } = router.query; // Get the location from the URL
  const [magicians, setMagicians] = useState<Magician[]>([]);

  useEffect(() => {
    const fetchMagicians = async () => {
      if (typeof location === 'string') {
        const [city, state] = location.split('-'); // Assert location is a string

        const { data, error } = await supabase
          .from('magician_locations')
          .select('magician_id')
          .eq('city', city) // Extract city from location
          .eq('state', state); // Extract state from location

        if (error) {
          console.error('Error fetching magicians:', error);
        } else {
          const magicianIds = data.map((loc: { magician_id: string }) => loc.magician_id);
          const { data: magicianData, error: magicianError } = await supabase
            .from('magicians')
            .select('*')
            .in('id', magicianIds);

          if (magicianError) {
            console.error('Error fetching magician details:', magicianError);
          } else {
            setMagicians(magicianData);
          }
        }
      }
    };

    fetchMagicians();
  }, [location]);

  return (
    <div>
      <h1>Magicians in {location}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {magicians.map((magician) => (
          <MagicianCard key={magician.id} magician={magician} />
        ))}
      </div>
    </div>
  );
};

export default LocationPage;
