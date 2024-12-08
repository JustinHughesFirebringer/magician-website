import { getPopularServices, getLocations } from '@/lib/db/queries';
import SearchForm from '@/components/SearchForm';
import { Wand2, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function HomePage() {
  const [popularServices, locations] = await Promise.all([
    getPopularServices(),
    getLocations()
  ]);

  return (
    <div className="relative min-h-screen">
      {/* Decorative Elements */}
      <div className="magic-glow absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2" />
      <div className="magic-glow absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2" />
      
      {/* Hero Section */}
      <section className="relative py-20 container">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Find the Perfect{' '}
            <span className="text-primary">Magician</span>
            <br />
            for Your Event
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover talented magicians in your area. From birthday parties to corporate events,
            find the right performer to make your occasion magical.
          </p>

          {/* Search Form */}
          <div className="mt-10 max-w-xl mx-auto">
            <SearchForm className="w-full" initialState="" initialCity="" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-center">Diverse Talents</CardTitle>
                <CardDescription className="text-center">
                  From close-up magic to grand illusions, find the perfect style for your event.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-secondary/10">
                  <MapPin className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-center">Local Performers</CardTitle>
                <CardDescription className="text-center">
                  Connect with talented magicians in your area for a personalized experience.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-accent/10">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-center">Verified Reviews</CardTitle>
                <CardDescription className="text-center">
                  Read authentic reviews from real clients to make an informed decision.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-16 bg-card">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">Popular Services</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {popularServices.map((service) => (
              <div
                key={service.service}
                className="inline-flex items-center rounded-full border px-4 py-2 text-lg font-semibold border-transparent bg-secondary text-secondary-foreground"
              >
                {service.service}
                <span className="ml-2 text-muted-foreground">({service.count})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Locations Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">Find Magicians Near You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.slice(0, 6).map((location) => (
              <Card key={`${location.city}-${location.state}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {location.city}, {location.state}
                  </CardTitle>
                  <CardDescription>
                    {location.magicianCount} magician{location.magicianCount !== 1 ? 's' : ''} available
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="magic-glow absolute inset-0 opacity-30" />
        <div className="container relative">
          <Card className="p-8 text-center">
            <CardHeader>
              <CardTitle className="text-3xl">Are You a Magician?</CardTitle>
              <CardDescription className="text-lg">
                Join our platform and reach more clients in your area.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="mt-4">
                List Your Services
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
