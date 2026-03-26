'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import GaleriaGrid from './GaleriaGrid'
import PhotoModal from './PhotoModal'
import type { Tattoo } from '@/lib/data'

const PAGE_SIZE = 24
const RECENT_PAGE_SIZE = 5

export default function HomeGallery({
  initialPhotos,
  initialTotal,
  recentPhotos,
}: {
  initialPhotos: Tattoo[]
  initialTotal: number
  recentPhotos: Tattoo[]
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

  // Recent section state
  const [recentList, setRecentList] = useState<Tattoo[]>(recentPhotos)
  const [recentPage, setRecentPage] = useState(1)
  const [recentDone, setRecentDone] = useState(recentPhotos.length < RECENT_PAGE_SIZE)
  const [loadingRecent, setLoadingRecent] = useState(false)
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
    const params = new URLSearchParams({ page: String(recentPage), limit: String(RECENT_PAGE_SIZE) })
    const res = await fetch(`/api/photos?${params}`)
    const { photos: more } = await res.json()
    const newPhotos = (more ?? []) as Tattoo[]
    if (newPhotos.length < RECENT_PAGE_SIZE) setRecentDone(true)
    setRecentList(prev => {
      const ids = new Set(prev.map(p => p.id))
      return [...prev, ...newPhotos.filter(p => !ids.has(p.id))]
    })
    setRecentPage(p => p + 1)
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
          {/* Recent section — hidden when searching */}
          {!isSearching && recentList.length > 0 && (
            <>
              <div className="mb-6">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Añadidos esta semana</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {recentList.map(t => (
                    <button key={t.id} onClick={() => setModalTattoo(t)} className="block rounded-xl overflow-hidden bg-gray-100 group">
                      <div className="relative" style={{ aspectRatio: '3/4' }}>
                        <Image
                          src={t.url}
                          alt={t.alt_text || t.title}
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
                  <div className="text-center mt-4">
                    <button
                      onClick={loadMoreRecent}
                      disabled={loadingRecent}
                      className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {loadingRecent ? 'Cargando...' : 'Ver más recientes →'}
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 mb-8" />
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

      {/* Modal for recent section clicks */}
      {modalTattoo && <PhotoModal tattoo={modalTattoo} onClose={() => setModalTattoo(null)} />}
    </div>
  )
}
