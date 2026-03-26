import Image from 'next/image'
import Link from 'next/link'
import { getPhotosPage } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { photos } = await getPhotosPage(0, 6, undefined, 'recientes')

  return (
    <div className="min-h-screen">
      <section className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <h1 className="text-5xl sm:text-7xl font-light tracking-tight mb-3">Sinkply</h1>
        <p className="text-sm text-gray-400 mb-10">Fine line tattoo studio · Madrid</p>
        <div className="flex gap-3">
          <Link href="/galeria" className="px-7 py-3.5 bg-[#111] text-white text-sm font-medium rounded-full hover:bg-black/80 transition-colors">
            Ver galería →
          </Link>
          <Link href="/artistas" className="px-7 py-3.5 border border-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors">
            Nuestros artistas →
          </Link>
        </div>
      </section>

      {photos.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-3 gap-2">
            {photos.map(p => (
              <Link key={p.id} href="/galeria" className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image src={p.url} alt={p.alt_text || ''} width={300} height={300} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" sizes="33vw" />
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/galeria" className="text-sm text-gray-500 hover:text-[#111] transition-colors">Ver todas →</Link>
          </div>
        </section>
      )}
    </div>
  )
}
