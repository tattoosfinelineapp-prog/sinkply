import { NextResponse } from 'next/server'
import { getPhotosPage } from '@/lib/queries'
import type { SortOrder } from '@/lib/queries'
import { expandQuery } from '@/lib/tagSynonyms'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '0', 10)
  const limit = parseInt(searchParams.get('limit') ?? '24', 10)
  const query = searchParams.get('q') ?? ''
  const orden = (searchParams.get('orden') as SortOrder) || undefined

  if (!query) {
    return NextResponse.json(await getPhotosPage(page, Math.min(limit, 48), undefined, orden))
  }

  const terms = expandQuery(query)
  const results = await Promise.all(terms.map(t => getPhotosPage(page, Math.min(limit, 48), t, orden)))
  const seen = new Set<string>()
  const merged = []
  for (const { photos } of results) {
    for (const p of photos) { if (!seen.has(p.id)) { seen.add(p.id); merged.push(p) } }
  }
  return NextResponse.json({ photos: merged.slice(0, Math.min(limit, 48)), total: Math.max(...results.map(r => r.total), 0) })
}
