import { Skeleton } from '@/components/ui/skeleton';

export default function MagicianLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Image */}
        <div className="w-full md:w-1/3">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full md:w-1/3" />
            <Skeleton className="h-10 w-full md:w-1/4" />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="mt-12 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
