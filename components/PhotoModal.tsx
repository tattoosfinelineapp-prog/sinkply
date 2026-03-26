'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X, Bookmark, Share2, User } from 'lucide-react'
import { useAuth } from './AuthContext'
import type { Tattoo } from '@/lib/data'

type Props = {
  tattoo: Tattoo
  onClose: () => void
}

export default function PhotoModal({ tattoo: initialTattoo, onClose }: Props) {
  const { user, savedIds, openSaveModal, openAuthModal } = useAuth()
  const [current, setCurrent] = useState<Tattoo>(initialTattoo)
  const [similares, setSimilares] = useState<Tattoo[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const isSaved = savedIds.has(current.id)

  const fetchSimilar = useCallback(async (tattoo: Tattoo, pageNum: number, append = false) => {
    const q = tattoo.tags[0] || tattoo.motivo || ''
    if (!q) return
    const res = await fetch(`/api/photos?q=${encodeURIComponent(q)}&limit=12&page=${pageNum}`)
    const data = await res.json()
    const filtered = (data.photos ?? []).filter((p: Tattoo) => p.id !== tattoo.id)
    if (!filtered.length) { setDone(true); return }
    setSimilares(prev => {
      if (!append) return filtered
      const ids = new Set(prev.map(p => p.id))
      return [...prev, ...filtered.filter((p: Tattoo) => !ids.has(p.id))]
    })
  }, [])

  // Load initial similar photos when current changes
  useEffect(() => {
    setSimilares([])
    setPage(0)
    setDone(false)
    fetchSimilar(current, 0)
    window.history.pushState(null, '', `/foto/${current.id}`)
    scrollRef.current?.scrollTo({ top: 0 })
  }, [current, fetchSimilar])

  // Escape key + body scroll lock
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      window.history.pushState(null, '', '/')
    }
  }, [onClose])

  // Infinite scroll for similar photos
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loadingRef.current || done) return
      loadingRef.current = true
      setLoadingMore(true)
      const nextPage = page + 1
      await fetchSimilar(current, nextPage, true)
      setPage(nextPage)
      loadingRef.current = false
      setLoadingMore(false)
    }, { rootMargin: '200px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [current, page, done, fetchSimilar])

  const handleSimilarClick = (t: Tattoo) => {
    setCurrent(t)
  }

  const share = async () => {
    const url = `${window.location.origin}/foto/${current.id}`
    if (navigator.share) {
      try { await navigator.share({ title: current.alt_text || 'Tatuaje', url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        ref={scrollRef}
        className="relative z-10 bg-white w-full max-w-3xl mx-auto mt-0 sm:mt-8 sm:rounded-3xl shadow-2xl overflow-y-auto"
        style={{ maxHeight: '95vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose} className="sticky top-4 float-right mr-4 z-20 p-2 rounded-full bg-white/90 text-gray-600 hover:bg-gray-100 shadow-sm">
          <X size={18} />
        </button>

        {/* Photo */}
        <div className="bg-gray-50 flex items-center justify-center p-4 sm:p-6">
          <Image
            src={current.url}
            alt={current.alt_text || current.title}
            width={800}
            height={current.height || 600}
            className="w-full h-auto max-h-[60vh] object-contain rounded-2xl"
            priority
          />
        </div>

        {/* Info */}
        <div className="p-5 sm:p-6">
          {/* Author + actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User size={16} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{current.tatuador}</p>
                {current.ciudad && <p className="text-xs text-gray-400">{current.ciudad}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => user ? openSaveModal(current.id) : openAuthModal()}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isSaved ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Guardado' : 'Guardar'}
              </button>
              <button onClick={share}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                <Share2 size={16} />
                {copied ? '¡Copiado!' : ''}
              </button>
            </div>
          </div>

          {/* Tags */}
          {current.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {current.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Similar photos */}
          {similares.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Más como esto</p>
              <div className="columns-3 gap-2">
                {similares.map(s => (
                  <div key={s.id} className="break-inside-avoid mb-2">
                    <button onClick={() => handleSimilarClick(s)} className="w-full rounded-xl overflow-hidden bg-gray-100 block">
                      <Image
                        src={s.url}
                        alt={s.alt_text || ''}
                        width={200}
                        height={s.height || 200}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div ref={sentinelRef} className="h-px" />
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
