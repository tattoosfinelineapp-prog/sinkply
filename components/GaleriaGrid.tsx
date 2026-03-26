'use client'

import { useState } from 'react'
import TattooCard from './TattooCard'
import PhotoModal from './PhotoModal'
import type { Tattoo } from '@/lib/data'

export default function GaleriaGrid({ tattoos }: { tattoos: Tattoo[] }) {
  const [modalTattoo, setModalTattoo] = useState<Tattoo | null>(null)

  if (!tattoos.length) return <p className="text-center text-sm text-gray-400 py-16">No se encontraron tatuajes</p>

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-2">
        {tattoos.map(t => (
          <div key={t.id} className="break-inside-avoid mb-2">
            <TattooCard tattoo={t} onOpen={setModalTattoo} />
          </div>
        ))}
      </div>
      {modalTattoo && <PhotoModal tattoo={modalTattoo} onClose={() => setModalTattoo(null)} />}
    </>
  )
}
