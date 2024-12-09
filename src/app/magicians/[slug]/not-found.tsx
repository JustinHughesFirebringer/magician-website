import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MagicianNotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Magician Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn't find the magician you're looking for. They might have moved or the link might be incorrect.
      </p>
      <Button asChild>
        <Link href="/magicians">
          Browse All Magicians
        </Link>
      </Button>
    </div>
  );
}
