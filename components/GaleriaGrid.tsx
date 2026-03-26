'use client'

import TattooCard from './TattooCard'
import type { Tattoo } from '@/lib/data'

export default function GaleriaGrid({ tattoos }: { tattoos: Tattoo[] }) {
  if (!tattoos.length) return <p className="text-center text-sm text-gray-400 py-16">No se encontraron tatuajes</p>
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2">
      {tattoos.map(t => (
        <div key={t.id} className="break-inside-avoid mb-2">
          <TattooCard tattoo={t} />
        </div>
      ))}
    </div>
  )
}
