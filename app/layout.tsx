import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthContext'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Sinkply — Fine Line Tattoo Studio',
  description: 'Estudio de tatuajes fine line en Madrid. Galería de diseños, artistas y reservas.',
  robots: 'index,follow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-[#111] antialiased min-h-screen" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
