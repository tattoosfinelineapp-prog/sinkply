import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthContext'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Sinkply Tattoo | Galería de tatuajes fine line · Madrid',
  description: 'Galería de tatuajes fine line del estudio Sinkply en Madrid. Actualizamos diariamente con los últimos trabajos de nuestros artistas. Inspírate para tu próximo tatuaje.',
  keywords: 'tatuajes fine line madrid, tatuaje minimalista, estudio tatuajes madrid, sinkply tattoo, tatuajes delicados, fine line tattoo',
  openGraph: {
    title: 'Sinkply Tattoo | Fine Line Studio Madrid',
    description: 'Galería actualizada diariamente con los mejores tatuajes fine line de Madrid.',
    url: 'https://sinkply.com',
    siteName: 'Sinkply Tattoo',
    locale: 'es_ES',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  metadataBase: new URL('https://sinkply.com'),
  alternates: {
    canonical: 'https://sinkply.com',
  },
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
