import { Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Magician } from '@/types/magician';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function MagicianCard({ magician }: { magician: Magician }) {
  return (
    <Link href={`/magicians/${magician.id}`} className="block">
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="magic-glow absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative h-48 w-full">
          <Image
            src="/placeholder-magician.jpg"
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
              {magician.location.city}, {magician.location.state}
            </span>
          </div>
          {magician.rating && (
            <div className="flex items-center mb-3">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1">
                {magician.rating.toFixed(1)}
                {magician.reviewCount && (
                  <span className="text-muted-foreground text-sm ml-1">
                    ({magician.reviewCount} reviews)
                  </span>
                )}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {magician.specialties.slice(0, 2).map((specialty) => (
              <Badge
                key={specialty}
                variant="secondary"
                className="transition-colors group-hover:bg-primary/20 group-hover:text-primary"
              >
                {specialty}
              </Badge>
            ))}
            {magician.specialties.length > 2 && (
              <Badge
                variant="outline"
                className="text-muted-foreground"
              >
                +{magician.specialties.length - 2} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
