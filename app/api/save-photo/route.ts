import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { photo_id, carpeta_id, action } = await req.json()
  if (!photo_id) return NextResponse.json({ error: 'photo_id requerido' }, { status: 400 })

  const userId = session.user.id

  if (action === 'unsave') {
    await supabase.from('saves').delete().eq('user_id', userId).eq('photo_id', photo_id)
    // Try to decrement saves_count (RPC may not exist yet)
    try { await supabase.rpc('decrement_saves', { p_photo_id: photo_id }) } catch {}
    return NextResponse.json({ ok: true })
  }

  // Save
  const insertData: Record<string, string> = { user_id: userId, photo_id }
  if (carpeta_id) insertData.carpeta_id = carpeta_id

  await supabase.from('saves').upsert(insertData, { onConflict: 'user_id,photo_id' })
  // Try to increment saves_count (RPC may not exist yet)
  try { await supabase.rpc('increment_saves', { p_photo_id: photo_id }) } catch {}

  return NextResponse.json({ ok: true })
}
