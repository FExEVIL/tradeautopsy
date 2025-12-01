import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Trade } from '@/lib/behavioral/types'
import JournalClient from './JournalClient'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  // ✅ Await cookies() because it's async in Next 15
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Use the already-resolved cookieStore, no further awaiting
        get(name: string) {
          return cookieStore.get(name)?.value ?? null
        },
        // No-ops on server component – middleware handles real cookie writes
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', session.user.id)
    .order('trade_date', { ascending: false })

  if (error) {
    console.error('Journal trades error:', error)
    return <div className="text-red-500">Error loading trades</div>
  }

  console.log('Journal trades count:', (data || []).length)

  return <JournalClient initialTrades={(data || []) as Trade[]} />
}
