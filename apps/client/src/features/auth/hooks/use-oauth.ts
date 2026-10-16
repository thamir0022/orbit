export const loginWithProvider = (provider: 'google' | 'github') => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/oauth/${provider}`

  // OAuth requires a full browser navigation to the authentication server.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(url)
}
