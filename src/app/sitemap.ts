import { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient()

  // Fetch all cities from city_state table
  const { data: locations } = await supabase
    .from('city_state')
    .select('city, state')

  // Create URLs for each location
  const searchUrls = (locations || []).map(loc => ({
    url: `https://magician-website.vercel.app/search?city=${encodeURIComponent(loc.city.toLowerCase())}&state=${encodeURIComponent(loc.state.toUpperCase())}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // Base URLs for the sitemap
  const baseUrls = [
    {
      url: 'https://magician-website.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://magician-website.vercel.app/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://magician-website.vercel.app/locations',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ] as const

  // Fetch all magician slugs for individual profile pages
  const { data: magicians } = await supabase
    .from('magicians')
    .select('slug')
    .not('slug', 'is', null)

  // Generate URLs for magician profile pages
  const magicianUrls = magicians?.map(magician => ({
    url: `https://magician-website.vercel.app/magicians/${magician.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })) || []

  // Combine all URLs
  return [...baseUrls, ...searchUrls, ...magicianUrls]
}
