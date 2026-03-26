import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function ArtistasPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  const { data: artists } = await supabase
    .from('users')
    .select('id, nombre, username, avatar, ciudad, bio')
    .eq('tipo_cuenta', 'tatuador')
    .order('followers_count', { ascending: false })

  // Get photo counts for each artist
  const artistsWithCounts = await Promise.all(
    (artists ?? []).map(async (a) => {
      const { count } = await supabase
        .from('photos')
        .select('id', { count: 'exact', head: true })
        .eq('tatuador_id', a.id)
        .eq('status', 'published')
      return { ...a, photoCount: count ?? 0 }
    })
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-lg font-light mb-8">Artistas</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {artistsWithCounts.map(a => (
          <Link
            key={a.id}
            href={`/${a.username ?? a.id}`}
            className="flex flex-col items-center p-5 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shrink-0 mb-3">
              {a.avatar
                ? <Image src={a.avatar} alt="" width={80} height={80} className="object-cover w-full h-full" />
                : <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-400">{(a.nombre ?? '?')[0].toUpperCase()}</div>
              }
            </div>
            <p className="text-sm font-medium text-[#111] truncate text-center">{a.nombre ?? a.username}</p>
            <p className="text-xs text-gray-400 mt-0.5">{a.photoCount} fotos</p>
          </Link>
        ))}
        {(!artists || artists.length === 0) && (
          <p className="col-span-full text-center text-sm text-gray-400 py-16">No hay artistas todavía</p>
        )}
      </div>
    </div>
  )
}
