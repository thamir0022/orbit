import { AxiosInstance } from "axios";
import { ApiSuccess, HttpRequestConfig } from "../types";
import { normalizeError } from "../errors";
import { InternalHttpRequest } from "./internal.types";

export class HttpClient {
  constructor(private readonly client: AxiosInstance) {}

  async get<T>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<ApiSuccess<T>> {
    return this.request({
      method: "GET",
      url,
      config,
    });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<ApiSuccess<T>> {
    return this.request({
      method: "POST",
      url,
      body: data,
      config,
    });
  }

  async put<T>(
    url: string,
    data: unknown,
    config?: HttpRequestConfig,
  ): Promise<ApiSuccess<T>> {
    return this.request({
      method: "PUT",
      url,
      body: data,
      config,
    });
  }

  async patch<T>(
    url: string,
    data: unknown,
    config?: HttpRequestConfig,
  ): Promise<ApiSuccess<T>> {
    return this.request({
      method: "PATCH",
      url,
      body: data,
      config,
    });
  }

  async delete<T>(
    url: string,
    data: unknown,
    config?: HttpRequestConfig,
  ): Promise<ApiSuccess<T>> {
    return this.request({
      method: "DELETE",
      url,
      body: data,
      config,
    });
  }

  private async request<T>({
    method,
    url,
    body,
    config,
  }: InternalHttpRequest): Promise<ApiSuccess<T>> {
    try {
      const { data } = await this.client.request<ApiSuccess<T>>({
        method,
        url,
        data: body,
        params: config?.params,
        headers: config?.headers,
        timeout: config?.timeout,
        signal: config?.signal,
        withCredentials: config?.withCredentials,
      });

      return data;
    } catch (error) {
      normalizeError(error);
    }
  }
}
