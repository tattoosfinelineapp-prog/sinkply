'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const MOTIVOS = [
  { label: 'Todos', value: '' },
  { label: 'Floral', value: 'floral' },
  { label: 'Luna', value: 'luna' },
  { label: 'Letras', value: 'letras' },
  { label: 'Animales', value: 'animales' },
  { label: 'Geométrico', value: 'geometrico' },
  { label: 'Minimalista', value: 'minimalista' },
  { label: 'Mariposa', value: 'mariposa' },
]

const ORDENES = [
  { label: 'Recientes', value: 'recientes' },
  { label: 'Más guardados', value: 'guardados' },
]

export default function GaleriaFiltros() {
  const router = useRouter()
  const sp = useSearchParams()
  const currentQ = sp.get('q') ?? ''
  const currentOrden = sp.get('orden') ?? 'recientes'

  const nav = (overrides: Record<string, string>) => {
    const params = new URLSearchParams()
    const q = overrides.q ?? currentQ
    const orden = overrides.orden ?? currentOrden
    if (q) params.set('q', q)
    if (orden !== 'recientes') params.set('orden', orden)
    router.push(`/galeria${params.toString() ? `?${params}` : ''}`, { scroll: false })
  }

  return (
    <div className="space-y-3 mb-5">
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {MOTIVOS.map(f => (
          <button key={f.value} onClick={() => nav({ q: f.value })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (f.value === '' ? !currentQ : currentQ === f.value) ? 'bg-[#111] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{f.label}</button>
        ))}
      </div>
      <div className="flex gap-2">
        {ORDENES.map(o => (
          <button key={o.value} onClick={() => nav({ orden: o.value })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentOrden === o.value ? 'bg-[#111] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            }`}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}
