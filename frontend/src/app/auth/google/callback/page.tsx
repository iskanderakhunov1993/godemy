'use client'

import { api } from '@/lib/api'
import { OAuthCallbackPage } from '@/components/oauth-callback'

export default function GoogleCallbackPage() {
  return (
    <OAuthCallbackPage
      providerLabel="Google"
      exchange={api.googleExchange}
      successRedirect="/guide"
      loginHref="/auth/login"
    />
  )
}
