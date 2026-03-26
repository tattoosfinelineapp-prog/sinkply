import { getPhotosPage } from '@/lib/queries'
import GaleriaInfinita from '@/components/GaleriaInfinita'
import Buscador from '@/components/Buscador'

export const dynamic = 'force-dynamic'

type Props = { searchParams: { q?: string } }

export default async function Home({ searchParams }: Props) {
  const query = (await searchParams).q?.trim() ?? ''
  const { photos, total } = await getPhotosPage(0, 24, query || undefined, 'recientes')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24">
      <div className="max-w-xl mx-auto mb-8">
        <Buscador />
      </div>
      <GaleriaInfinita initialPhotos={photos} initialTotal={total} query={query} />
    </div>
  )
}
