import { NextResponse } from 'next/server'
import { getRecentPhotos } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '0', 10)
  const limit = parseInt(searchParams.get('limit') ?? '12', 10)

  const result = await getRecentPhotos(page, Math.min(limit, 48))
  return NextResponse.json(result)
}
