interface Tokens {
  accessToken: string
  accessTokenExpiresIn: number
  refreshToken: string
  refreshTokenExpiresIn: number
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
}

export interface SignUpResult {
  tokens: Tokens
  user: User
}
