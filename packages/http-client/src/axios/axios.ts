import axios, { AxiosInstance } from "axios";
import { AxiosOptions, AxiosInterceptor } from "./types/axios.types";

export class AxiosBuilder {
  private readonly client: AxiosInstance;

  private constructor({
    baseURL,
    headers,
    timeout,
    withCredentials,
  }: AxiosOptions) {
    this.client = axios.create({
      baseURL,
      timeout,
      withCredentials,
      headers: {
        ...DEFAULT_HEADERS,
        ...headers,
      },
    });
  }

  static create({
    baseURL,
    headers,
    timeout = 30000,
    withCredentials = true,
  }: AxiosOptions) {
    if (!baseURL.trim()) throw new Error("AxiosBuilder: baseURL is required.");

    return new AxiosBuilder({
      baseURL,
      headers,
      timeout,
      withCredentials,
    });
  }

  /**
   * Registers a plugin.
   */
  use(plugin: AxiosInterceptor): this {
    plugin(this.client);

    return this;
  }

  /**
   * Returns the configured Axios instance.
   */
  build(): AxiosInstance {
    return this.client;
  }
}

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;
