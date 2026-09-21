import {
  authInterceptor,
  AxiosBuilder,
  HttpClient,
  loggingInterceptor,
} from '@orbit/http-client'
import { handleUnauthorized } from './handle-unauthorized'

const axios = AxiosBuilder.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
})
  .use(loggingInterceptor())
  .use(authInterceptor({ onUnauthorized: handleUnauthorized }))
  .build()

export const httpClient = new HttpClient(axios)
