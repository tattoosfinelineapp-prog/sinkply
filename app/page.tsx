import { getPhotosPage } from '@/lib/queries'
import HomeGallery from '@/components/HomeGallery'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { photos, total } = await getPhotosPage(0, 24, undefined, 'recientes')

  return <HomeGallery initialPhotos={photos} initialTotal={total} />
}
