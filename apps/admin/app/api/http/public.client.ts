import { AxiosBuilder, HttpClient } from "@orbit/http-client";

const axios = AxiosBuilder.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
}).build();

export const publicHttp = new HttpClient(axios);
