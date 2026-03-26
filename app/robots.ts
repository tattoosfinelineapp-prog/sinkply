import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/upload', '/registro/tatuador'],
      },
    ],
    sitemap: 'https://sinkply.com/sitemap.xml',
  }
}
