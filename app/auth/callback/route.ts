import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://sinkply.com'
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=auth_failed', origin))
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session?.user) {
    console.error('[auth/callback]', error?.message ?? 'no session')
    return NextResponse.redirect(new URL('/?error=auth_failed', origin))
  }

  const user = data.session.user

  // Upsert public.users via service role (bypasses RLS)
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
      const meta = user.user_metadata ?? {}

      const { data: existing } = await admin
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existing) {
        await admin.from('users').upsert({
          id: user.id,
          email: user.email ?? '',
          nombre: meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? '',
          avatar: meta.avatar_url ?? meta.picture ?? null,
          tipo: 'cliente',
          tipo_cuenta: 'cliente',
          username: (user.email ?? '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || null,
        }, { onConflict: 'id', ignoreDuplicates: false })
      }
    }
  } catch (e) {
    console.error('[auth/callback] upsert error:', e)
  }

  return NextResponse.redirect(new URL('/', origin))
}
