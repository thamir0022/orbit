import {
  AxiosBuilder,
  HttpClient,
  loggingInterceptor,
} from "@orbit/http-client";

const axios = AxiosBuilder.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
})
  .use(loggingInterceptor())
  .build();

export const privateHttp = new HttpClient(axios);
