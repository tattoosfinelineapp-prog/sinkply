'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import type { Tattoo } from '@/lib/data'

type Props = {
  tattoo: Tattoo
  onOpen?: (tattoo: Tattoo) => void
}

export default function TattooCard({ tattoo, onOpen }: Props) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onOpen) onOpen(tattoo)
  }

  return (
    <a href={`/foto/${tattoo.id}`} onClick={handleClick}>
      <div
        className="relative rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {imgError ? (
          <div className="w-full bg-gray-100 flex items-center justify-center" style={{ aspectRatio: `400/${tattoo.height || 350}` }}>
            <span className="text-gray-300 text-xs">Error</span>
          </div>
        ) : (
          <Image
            src={tattoo.url}
            alt={tattoo.alt_text || `Tatuaje fine line ${tattoo.tags?.join(' ') || ''} Sinkply Madrid`}
            width={400}
            height={tattoo.height || 350}
            className="w-full h-auto block transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-medium drop-shadow truncate">{tattoo.tatuador}</span>
            <span className="flex items-center gap-1 text-xs drop-shadow">
              <Heart size={12} /> {tattoo.likes}
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}
