import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUserByUsername, getUserById, getPhotosByTatuador } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const RESERVED = new Set(['galeria', 'artistas', 'upload', 'registro', 'auth', 'api', 'foto', '_next'])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  if (RESERVED.has(username.toLowerCase())) notFound()

  const user = UUID_RE.test(username)
    ? await getUserById(username)
    : await getUserByUsername(username)
  if (!user) notFound()

  const photos = await getPhotosByTatuador(user.id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-24">
      <Link href="/" className="text-sm text-gray-400 hover:text-[#111] transition-colors mb-6 inline-block">← Inicio</Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
          {user.avatar
            ? <Image src={user.avatar} alt={user.nombre ?? ''} width={80} height={80} className="object-cover w-full h-full" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-400">{(user.nombre ?? '?')[0].toUpperCase()}</div>
          }
        </div>
        <div>
          <h1 className="text-xl font-medium">{user.nombre ?? user.username}</h1>
          {user.username && <p className="text-sm text-gray-400">@{user.username}</p>}
          {user.ciudad && <p className="text-xs text-gray-400 mt-0.5">{user.ciudad}</p>}
        </div>
      </div>

      {user.bio && <p className="text-sm text-gray-500 mb-6 max-w-lg">{user.bio}</p>}

      <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">{photos.length} trabajos</p>

      {photos.length > 0 ? (
        <div className="columns-2 sm:columns-3 gap-2">
          {photos.map(p => (
            <div key={p.id} className="break-inside-avoid mb-2">
              <Link href={`/foto/${p.id}`}>
                <div className="rounded-xl overflow-hidden bg-gray-100 group">
                  <Image src={p.url} alt={p.alt_text || p.title} width={400} height={p.height || 350}
                    className="w-full h-auto block hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw" loading="lazy" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-16">Sin trabajos publicados</p>
      )}
    </div>
  )
}
