import { Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Magician } from '../types/magician';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

export default function MagicianCard({ magician }: { magician: Magician }) {
  return (
    <Link href={`/magicians/${magician.id}`} className="block">
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="magic-glow absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative h-48 w-full">
          <Image
            src={magician.image_url || '/placeholder-magician.jpg'}
            alt={magician.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
        <CardContent className="relative p-4">
          <h3 className="text-xl font-semibold mb-2">{magician.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {magician.locations[0].city}, {magician.locations[0].state}
            </span>
          </div>
          {magician.rating && (
            <div className="flex items-center mb-3">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1">
                {magician.rating.toFixed(1)}
                {magician.review_count && (
                  <span className="text-muted-foreground text-sm ml-1">
                    ({magician.review_count} reviews)
                  </span>
                )}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {magician.availability.slice(0, 2).map((service) => (
              <div
                key={service}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary"
              >
                {service}
              </div>
            ))}
            {magician.availability.length > 2 && (
              <div
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
              >
                +{magician.availability.length - 2} more
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
