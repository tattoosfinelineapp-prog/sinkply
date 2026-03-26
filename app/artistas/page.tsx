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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-[#111] transition-colors">← Inicio</Link>
        <h1 className="text-lg font-light">Nuestros artistas</h1>
      </div>

      <div className="space-y-4">
        {(artists ?? []).map(a => (
          <Link key={a.id} href={`/${a.username ?? a.id}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shrink-0">
              {a.avatar
                ? <Image src={a.avatar} alt="" width={56} height={56} className="object-cover w-full h-full" />
                : <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-gray-400">{(a.nombre ?? '?')[0].toUpperCase()}</div>
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#111] truncate">{a.nombre ?? a.username}</p>
              {a.ciudad && <p className="text-xs text-gray-400">{a.ciudad}</p>}
              {a.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{a.bio}</p>}
            </div>
          </Link>
        ))}
        {(!artists || artists.length === 0) && (
          <p className="text-center text-sm text-gray-400 py-16">No hay artistas todavía</p>
        )}
      </div>
    </div>
  )
}
