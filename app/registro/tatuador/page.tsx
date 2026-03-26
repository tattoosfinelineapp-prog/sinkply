'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

export default function RegistroTatuadorPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const cleanUsername = form.username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { nombre: form.nombre, username: cleanUsername, tipo_cuenta: 'tatuador' } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id, email: form.email, nombre: form.nombre,
        username: cleanUsername, tipo_cuenta: 'tatuador', tipo: 'tatuador',
      })
    }
    router.push(`/${cleanUsername}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield size={20} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Acceso exclusivo</span>
        </div>

        <h1 className="text-2xl font-light text-center mb-2">Registro de artista</h1>

        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-center">
          <p className="text-sm text-gray-500 leading-relaxed">
            Acceso exclusivo para artistas de Sinkply.<br />
            Si recibiste este enlace de nuestro equipo,<br />
            completa tu registro aquí.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nombre artístico" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#111]" />
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
            <input type="text" placeholder="username" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))} required
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#111]" />
          </div>
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#111]" />
          <input type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#111]" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#111] text-white rounded-xl text-sm font-medium hover:bg-black/80 disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear cuenta de artista'}
          </button>
        </form>
      </div>
    </div>
  )
}
