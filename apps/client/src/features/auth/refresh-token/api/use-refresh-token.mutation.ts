import { useMutation } from '@tanstack/react-query'
import { refreshTokenApi } from './refresh-token.api'
import { useUserStore } from '@/entities/user/model/user.store'

export function useRefreshTokenMutation() {
  const setAccessToken = useUserStore((state) => state.setAccessToken)

  return useMutation({
    mutationFn: refreshTokenApi,
    onSuccess: (newAccessToken) => {
      setAccessToken(newAccessToken)
    },
  })
}
