'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function Buscador() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  const submit = (q: string) => {
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q.trim())}`, { scroll: false })
    } else {
      router.push('/', { scroll: false })
    }
  }

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => {
          setValue(e.target.value)
          submit(e.target.value)
        }}
        placeholder="Busca tu próximo tatuaje..."
        className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl text-sm text-gray-800 placeholder-gray-400 border border-transparent focus:outline-none focus:border-gray-200 focus:bg-white transition-colors"
      />
      {value && (
        <button
          onClick={() => { setValue(''); submit('') }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
