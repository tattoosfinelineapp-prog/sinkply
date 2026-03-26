import { getPhotosPage } from '@/lib/queries'
import type { SortOrder } from '@/lib/queries'
import GaleriaInfinita from '@/components/GaleriaInfinita'
import GaleriaFiltros from '@/components/GaleriaFiltros'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ q?: string; orden?: string }> }

export default async function GaleriaPage({ searchParams }: Props) {
  const sp = await searchParams
  const query = sp.q?.trim() ?? ''
  const orden = (sp.orden as SortOrder) || 'recientes'
  const { photos, total } = await getPhotosPage(0, 24, query || undefined, orden)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-24">
      <GaleriaFiltros />
      <GaleriaInfinita initialPhotos={photos} initialTotal={total} query={query} />
    </div>
  )
}
