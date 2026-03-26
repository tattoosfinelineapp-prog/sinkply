'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import GaleriaGrid from './GaleriaGrid'
import type { Tattoo } from '@/lib/data'

const PAGE_SIZE = 24

export default function HomeGallery({ initialPhotos, initialTotal }: { initialPhotos: Tattoo[]; initialTotal: number }) {
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

  doneRef.current = done

  // Search with debounce — calls /api/photos which uses expandQuery for synonyms
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24">
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
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
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
          <GaleriaGrid tattoos={photos} />
          <div ref={sentinelRef} className="h-px" />
          {loadingMore && (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
