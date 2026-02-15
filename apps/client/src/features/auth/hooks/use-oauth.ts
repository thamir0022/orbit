export const loginWithProvider = (provider: 'google' | 'github') => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/oauth/${provider}`
  window.location.assign(url)
}
