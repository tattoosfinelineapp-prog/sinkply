import Link from 'next/link'
import { getPhotosPage } from '@/lib/queries'
import type { SortOrder } from '@/lib/queries'
import GaleriaInfinita from '@/components/GaleriaInfinita'
import GaleriaFiltros from '@/components/GaleriaFiltros'

export const dynamic = 'force-dynamic'

type Props = { searchParams: { q?: string; orden?: string } }

export default async function GaleriaPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? ''
  const orden = (searchParams.orden as SortOrder) || 'recientes'
  const { photos, total } = await getPhotosPage(0, 24, query || undefined, orden)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-[#111] transition-colors">← Inicio</Link>
          <h1 className="text-lg font-light">Sinkply · Galería</h1>
        </div>
      </div>
      <GaleriaFiltros />
      <GaleriaInfinita initialPhotos={photos} initialTotal={total} query={query} />
    </div>
  )
}
