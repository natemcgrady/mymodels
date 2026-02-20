import { SignInPageClient } from './sign-in-page-client'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId } from '@/server/data/profiles'

export const dynamic = 'force-dynamic'

export default async function SignInPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const profile = await getProfileByUserId(user.id)
    if (profile?.username) {
      redirect(`/${profile.username}`)
    }
  }

  return <SignInPageClient />
}
