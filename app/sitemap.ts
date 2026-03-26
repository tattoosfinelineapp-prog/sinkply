import { MetadataRoute } from 'next'
import { getPhotos } from '@/lib/queries'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://sinkply.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/artistas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/galeria`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  // Photo pages
  const photos = await getPhotos(2000)
  const photoPages: MetadataRoute.Sitemap = photos.map(p => ({
    url: `${base}/foto/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Artist pages
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const { data: artists } = await supabase
    .from('users')
    .select('username')
    .eq('tipo_cuenta', 'tatuador')

  const artistPages: MetadataRoute.Sitemap = (artists ?? [])
    .filter(a => a.username)
    .map(a => ({
      url: `${base}/${a.username}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [...staticPages, ...artistPages, ...photoPages]
}
