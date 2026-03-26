import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SINKPLY_MAIN_ID = 'c01f31dd-5898-4a95-9061-ab66c65102df'

export async function PATCH(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Verify user is tatuador
  const { data: userData } = await supabase
    .from('users')
    .select('tipo_cuenta')
    .eq('id', session.user.id)
    .single()

  if (!userData || (userData.tipo_cuenta !== 'tatuador' && userData.tipo_cuenta !== 'estudio')) {
    return NextResponse.json({ error: 'Solo tatuadores pueden editar' }, { status: 403 })
  }

  const { photo_id, tags, tatuador_id } = await req.json()
  if (!photo_id) return NextResponse.json({ error: 'photo_id requerido' }, { status: 400 })

  const updates: Record<string, unknown> = {}

  // Update tags if provided
  if (Array.isArray(tags)) {
    updates.tags = tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
  }

  // Claim photo — only if currently owned by the main Sinkply account
  if (tatuador_id) {
    const { data: photo } = await supabase
      .from('photos')
      .select('tatuador_id')
      .eq('id', photo_id)
      .single()

    if (!photo || photo.tatuador_id !== SINKPLY_MAIN_ID) {
      return NextResponse.json({ error: 'Esta foto no se puede reclamar' }, { status: 403 })
    }

    updates.tatuador_id = tatuador_id
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const { error } = await supabase
    .from('photos')
    .update(updates)
    .eq('id', photo_id)

  if (error) {
    console.error('[update-photo-tags]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
