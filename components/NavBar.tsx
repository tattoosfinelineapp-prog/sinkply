'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="text-lg font-light tracking-tight text-[#111]">
          Sinkply
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/artistas"
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              pathname === '/artistas'
                ? 'text-[#111] font-medium'
                : 'text-gray-500 hover:text-[#111]'
            }`}
          >
            Artistas
          </Link>
          <Link
            href="/registro"
            className="px-4 py-2 text-sm text-gray-500 hover:text-[#111] rounded-lg transition-colors"
          >
            Entrar
          </Link>
        </div>
      </div>
    </nav>
  )
}
