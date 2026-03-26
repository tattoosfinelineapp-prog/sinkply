import { getPhotosPage } from '@/lib/queries'
import HomeGallery from '@/components/HomeGallery'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [gallery, recent] = await Promise.all([
    getPhotosPage(0, 24, undefined, 'recientes'),
    getPhotosPage(0, 5, undefined, 'recientes'),
  ])

  return (
    <HomeGallery
      initialPhotos={gallery.photos}
      initialTotal={gallery.total}
      recentPhotos={recent.photos.slice(0, 5)}
    />
  )
}
