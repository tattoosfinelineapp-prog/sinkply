'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, Session } from '@supabase/supabase-js'
import AuthModal from './AuthModal'
import SaveModal from './SaveModal'

type AuthContextType = {
  user: User | null
  session: Session | null
  username: string | null
  tipoCuenta: string | null
  authReady: boolean
  savedIds: Set<string>
  openAuthModal: (mode?: 'login' | 'register') => void
  signOut: () => Promise<void>
  openSaveModal: (photoId: string) => void
  toggleSave: (photoId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, username: null, tipoCuenta: null, authReady: false,
  savedIds: new Set(),
  openAuthModal: () => {}, signOut: async () => {},
  openSaveModal: () => {}, toggleSave: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [tipoCuenta, setTipoCuenta] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login')
  const [saveModalPhotoId, setSaveModalPhotoId] = useState<string | null>(null)

  const loadUserData = useCallback(async (userId: string) => {
    const [savesRes, userRes] = await Promise.all([
      supabase.from('saves').select('photo_id').eq('user_id', userId),
      supabase.from('users').select('username, tipo_cuenta').eq('id', userId).single(),
    ])
    if (savesRes.data) setSavedIds(new Set(savesRes.data.map((r: { photo_id: string }) => r.photo_id)))
    if (userRes.data) {
      setUsername(userRes.data.username)
      setTipoCuenta(userRes.data.tipo_cuenta)
    }
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s); setUser(s?.user ?? null); setAuthReady(true)
      if (s?.user) loadUserData(s.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null); setAuthReady(true)
      if (s?.user) loadUserData(s.user.id)
      else { setSavedIds(new Set()); setUsername(null); setTipoCuenta(null) }
      if (s) setModalOpen(false)
    })
    return () => subscription.unsubscribe()
  }, [supabase, loadUserData])

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setModalMode(mode); setModalOpen(true)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null); setSession(null); setSavedIds(new Set()); setUsername(null); setTipoCuenta(null)
  }, [supabase])

  const openSaveModal = useCallback((photoId: string) => {
    if (!user) { openAuthModal(); return }
    setSaveModalPhotoId(photoId)
  }, [user, openAuthModal])

  const toggleSave = useCallback(async (photoId: string) => {
    if (!user) { openAuthModal(); return }
    const isSaved = savedIds.has(photoId)
    setSavedIds(prev => {
      const next = new Set(prev)
      isSaved ? next.delete(photoId) : next.add(photoId)
      return next
    })
    await fetch('/api/save-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_id: photoId, action: isSaved ? 'unsave' : 'save' }),
    })
  }, [user, savedIds, openAuthModal])

  const handleSaved = useCallback(async (carpetaId?: string) => {
    if (!user || !saveModalPhotoId) return
    if (!savedIds.has(saveModalPhotoId)) {
      setSavedIds(prev => new Set(prev).add(saveModalPhotoId))
      await fetch('/api/save-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: saveModalPhotoId, carpeta_id: carpetaId }),
      })
    }
  }, [user, saveModalPhotoId, savedIds])

  const handleUnsave = useCallback(async () => {
    if (!user || !saveModalPhotoId) return
    setSavedIds(prev => { const n = new Set(prev); n.delete(saveModalPhotoId); return n })
    await fetch('/api/save-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_id: saveModalPhotoId, action: 'unsave' }),
    })
  }, [user, saveModalPhotoId])

  return (
    <AuthContext.Provider value={{ user, session, username, tipoCuenta, authReady, savedIds, openAuthModal, signOut, openSaveModal, toggleSave }}>
      {children}
      {modalOpen && <AuthModal mode={modalMode} onClose={() => setModalOpen(false)} onSwitchMode={setModalMode} />}
      {saveModalPhotoId && (
        <SaveModal
          photoId={saveModalPhotoId}
          isSaved={savedIds.has(saveModalPhotoId)}
          onClose={() => setSaveModalPhotoId(null)}
          onSaved={handleSaved}
          onUnsave={handleUnsave}
        />
      )}
    </AuthContext.Provider>
  )
}
