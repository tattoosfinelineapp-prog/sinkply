'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  username: string | null
  authReady: boolean
  lovedIds: Set<string>
  wantedIds: Set<string>
  savedIds: Set<string>
  openAuthModal: (mode?: string) => void
  signOut: () => Promise<void>
  toggleLove: (photoId: string) => Promise<void>
  toggleWant: (photoId: string) => Promise<void>
  openSaveModal: (photoId: string) => void
  toggleSave: (photoId: string) => Promise<void>
  likeToast: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, username: null, authReady: false,
  lovedIds: new Set(), wantedIds: new Set(), savedIds: new Set(),
  openAuthModal: () => {}, signOut: async () => {},
  toggleLove: async () => {}, toggleWant: async () => {},
  openSaveModal: () => {}, toggleSave: async () => {},
  likeToast: false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [lovedIds] = useState(new Set<string>())
  const [wantedIds] = useState(new Set<string>())
  const [savedIds] = useState(new Set<string>())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s); setUser(s?.user ?? null); setAuthReady(true)
      if (s?.user) {
        supabase.from('users').select('username').eq('id', s.user.id).single()
          .then(({ data }) => { if (data?.username) setUsername(data.username) })
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); setUser(s?.user ?? null); setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={{
      user, session, username, authReady,
      lovedIds, wantedIds, savedIds,
      openAuthModal: () => {}, signOut: async () => { await supabase.auth.signOut(); setUser(null); setSession(null) },
      toggleLove: async () => {}, toggleWant: async () => {},
      openSaveModal: () => {}, toggleSave: async () => {},
      likeToast: false,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
