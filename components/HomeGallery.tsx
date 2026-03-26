'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import GaleriaGrid from './GaleriaGrid'
import PhotoModal from './PhotoModal'
import type { Tattoo } from '@/lib/data'

const PAGE_SIZE = 24
const RECENT_LOAD_SIZE = 12

export default function HomeGallery({
  initialPhotos,
  initialTotal,
  recentPhotos,
  recentTotal,
}: {
  initialPhotos: Tattoo[]
  initialTotal: number
  recentPhotos: Tattoo[]
  recentTotal: number
}) {
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<Tattoo[]>(initialPhotos)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [done, setDone] = useState(initialPhotos.length >= initialTotal)
  const pageRef = useRef(1)
  const loadingRef = useRef(false)
  const doneRef = useRef(done)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Recent section
  const [recentList, setRecentList] = useState<Tattoo[]>(recentPhotos)
  const [recentDone, setRecentDone] = useState(recentPhotos.length >= recentTotal)
  const [loadingRecent, setLoadingRecent] = useState(false)
  const recentOffsetRef = useRef(recentPhotos.length)

  const [modalTattoo, setModalTattoo] = useState<Tattoo | null>(null)

  doneRef.current = done

  const doSearch = useCallback(async (q: string) => {
    setLoading(true)
    pageRef.current = 0
    const params = new URLSearchParams({ page: '0', limit: String(PAGE_SIZE) })
    if (q.trim()) params.set('q', q.trim())
    const res = await fetch(`/api/photos?${params}`)
    const { photos: results, total } = await res.json()
    setPhotos(results ?? [])
    const isDone = (results?.length ?? 0) >= total
    setDone(isDone)
    doneRef.current = isDone
    pageRef.current = 1
    setLoading(false)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const handleClear = () => {
    setQuery('')
    setPhotos(initialPhotos)
    setDone(initialPhotos.length >= initialTotal)
    doneRef.current = initialPhotos.length >= initialTotal
    pageRef.current = 1
  }

  const loadMoreRecent = async () => {
    setLoadingRecent(true)
    const offset = recentOffsetRef.current
    // Calculate page and use limit=RECENT_LOAD_SIZE
    const page = Math.floor(offset / RECENT_LOAD_SIZE)
    const res = await fetch(`/api/recent-photos?page=${page}&limit=${RECENT_LOAD_SIZE}`)
    const { photos: more } = await res.json()
    const newPhotos = (more ?? []) as Tattoo[]
    if (newPhotos.length < RECENT_LOAD_SIZE) setRecentDone(true)
    setRecentList(prev => {
      const ids = new Set(prev.map(p => p.id))
      return [...prev, ...newPhotos.filter(p => !ids.has(p.id))]
    })
    recentOffsetRef.current = offset + newPhotos.length
    setLoadingRecent(false)
  }

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loadingRef.current || doneRef.current) return
      loadingRef.current = true
      setLoadingMore(true)
      const params = new URLSearchParams({ page: String(pageRef.current), limit: String(PAGE_SIZE) })
      if (query) params.set('q', query.trim())
      const res = await fetch(`/api/photos?${params}`)
      const { photos: np } = await res.json()
      const finalPhotos = (np ?? []) as Tattoo[]
      setPhotos(prev => {
        const ids = new Set(prev.map(p => p.id))
        return [...prev, ...finalPhotos.filter(p => !ids.has(p.id))]
      })
      if (!finalPhotos.length) { doneRef.current = true; setDone(true) }
      pageRef.current++
      loadingRef.current = false
      setLoadingMore(false)
    }, { rootMargin: '400px' })
    const t = setTimeout(() => observer.observe(sentinel), 100)
    return () => { clearTimeout(t); observer.disconnect() }
  }, [query])

  const isSearching = !!query

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24">
      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="Busca tu próximo tatuaje..."
            className="w-full pl-11 pr-10 py-3.5 bg-white rounded-xl text-sm text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
          />
          {query && (
            <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Recent section */}
          {!isSearching && recentList.length > 0 && (
            <>
              <div className="mb-6">
                <p
                  className="mb-4"
                  style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}
                >
                  Añadidos esta semana
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5" style={{ gap: '8px' }}>
                  {recentList.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setModalTattoo(t)}
                      className="block overflow-hidden bg-gray-100 group"
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="relative" style={{ aspectRatio: '3/4' }}>
                        <Image
                          src={t.url}
                          alt={t.alt_text || `Tatuaje fine line ${t.tags?.join(' ') || ''} Sinkply Madrid`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 33vw, 20vw"
                          loading="lazy"
                        />
                      </div>
                    </button>
                  ))}
                </div>
                {!recentDone && (
                  <div className="text-center mt-5">
                    <button
                      onClick={loadMoreRecent}
                      disabled={loadingRecent}
                      className="text-sm font-medium disabled:opacity-50 transition-colors"
                      style={{
                        padding: '8px 20px',
                        border: '1px solid #111',
                        borderRadius: '10px',
                        background: '#fff',
                        color: '#111',
                      }}
                    >
                      {loadingRecent ? 'Cargando...' : 'Ver más →'}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', marginBottom: '32px' }} />
            </>
          )}

          {/* Main gallery */}
          <GaleriaGrid tattoos={photos} />
          <div ref={sentinelRef} className="h-px" />
          {loadingMore && (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
            </div>
          )}
        </>
      )}

      {modalTattoo && <PhotoModal tattoo={modalTattoo} onClose={() => setModalTattoo(null)} />}

      {/* SEO hidden text */}
      <p className="sr-only">
        Galería de tatuajes fine line actualizados diariamente. Estudio Sinkply en Madrid. Inspírate con los últimos trabajos de nuestros artistas.
      </p>

      {/* Footer */}
      <footer className="text-center pt-12 pb-4">
        <p className="text-xs text-gray-300">
          © 2026 Sinkply Tattoo · Madrid
          {' · '}
          <a href="/privacidad" className="text-gray-400 hover:text-gray-500 transition-colors">Política de privacidad</a>
        </p>
      </footer>
    </div>
  )
}
