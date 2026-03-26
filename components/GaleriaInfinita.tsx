'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import GaleriaGrid from './GaleriaGrid'
import type { Tattoo } from '@/lib/data'

const PAGE_SIZE = 24

export default function GaleriaInfinita({ initialPhotos, initialTotal, query = '' }: { initialPhotos: Tattoo[]; initialTotal: number; query?: string }) {
  const searchParams = useSearchParams()
  const orden = searchParams.get('orden') ?? 'recientes'

  const [photos, setPhotos] = useState<Tattoo[]>(initialPhotos)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(initialPhotos.length >= initialTotal)
  const pageRef = useRef(1)
  const loadingRef = useRef(false)
  const doneRef = useRef(done)
  const sentinelRef = useRef<HTMLDivElement>(null)
  doneRef.current = done

  useEffect(() => {
    setPhotos(initialPhotos); setDone(initialPhotos.length >= initialTotal)
    doneRef.current = initialPhotos.length >= initialTotal; pageRef.current = 1
  }, [initialPhotos, initialTotal])

  useEffect(() => {
    const sentinel = sentinelRef.current; if (!sentinel) return
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loadingRef.current || doneRef.current) return
      loadingRef.current = true; setLoading(true)
      const params = new URLSearchParams({ page: String(pageRef.current), limit: String(PAGE_SIZE) })
      if (query) params.set('q', query)
      if (orden !== 'recientes') params.set('orden', orden)
      const res = await fetch(`/api/photos?${params}`)
      const { photos: np } = await res.json()
      let finalPhotos = np as Tattoo[]
      if (!finalPhotos.length && query) {
        const fb = await fetch(`/api/photos?page=${pageRef.current}&limit=${PAGE_SIZE}&orden=guardados`)
        finalPhotos = ((await fb.json()).photos ?? []) as Tattoo[]
      }
      setPhotos(prev => {
        const ids = new Set(prev.map(p => p.id))
        const merged = [...prev, ...finalPhotos.filter(p => !ids.has(p.id))]
        const isDone = !finalPhotos.length; doneRef.current = isDone; setDone(isDone)
        return merged
      })
      pageRef.current++; loadingRef.current = false; setLoading(false)
    }, { rootMargin: '400px' })
    const t = setTimeout(() => observer.observe(sentinel), 100)
    return () => { clearTimeout(t); observer.disconnect() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <GaleriaGrid tattoos={photos} />
      <div ref={sentinelRef} className="h-px" />
      {loading && <div className="flex justify-center py-10"><div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" /></div>}
    </div>
  )
}
