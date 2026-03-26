import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPhotoById, getUserById } from '@/lib/queries'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const tattoo = await getPhotoById(id)
  if (!tattoo) return { title: 'No encontrado' }
  const tags = tattoo.tags.join(', ')
  return {
    title: `${tags || 'Fine line tattoo'} — Sinkply`,
    description: `Tatuaje fine line: ${tags}. Por ${tattoo.tatuador}.`,
    openGraph: {
      title: `${tags} — Sinkply`,
      images: [{ url: tattoo.url }],
      type: 'article',
      siteName: 'Sinkply',
    },
  }
}

export default async function FotoPage({ params }: Props) {
  const { id } = await params
  const tattoo = await getPhotoById(id)
  if (!tattoo) notFound()
  const artist = tattoo.tatuador_id ? await getUserById(tattoo.tatuador_id) : null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: tattoo.url,
    description: tattoo.alt_text || tattoo.tags.join(', '),
    author: artist ? { '@type': 'Person', name: artist.nombre } : undefined,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Link href="/" className="text-sm text-gray-400 hover:text-[#111] mb-6 inline-block">← Volver</Link>
      <div className="rounded-2xl overflow-hidden bg-gray-100 mb-6">
        <Image src={tattoo.url} alt={tattoo.alt_text || ''} width={800} height={tattoo.height || 600} className="w-full h-auto" priority />
      </div>
      {artist && (
        <Link href={`/${artist.username ?? artist.id}`} className="flex items-center gap-3 mb-4 group">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
            {artist.avatar
              ? <Image src={artist.avatar} alt="" width={40} height={40} className="object-cover w-full h-full" />
              : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-400">{(artist.nombre ?? '?')[0].toUpperCase()}</div>
            }
          </div>
          <p className="text-sm font-medium group-hover:underline">{artist.nombre ?? artist.username}</p>
        </Link>
      )}
      {tattoo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {tattoo.tags.map(tag => (
            <Link key={tag} href={`/galeria?q=${encodeURIComponent(tag)}`} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200">
              #{tag}
            </Link>
          ))}
        </div>
      )}
      <div className="text-center pt-6 border-t border-gray-100">
        <Link href="/" className="text-sm text-gray-500 hover:text-[#111]">Ver más en Sinkply →</Link>
      </div>
    </div>
  )
}
