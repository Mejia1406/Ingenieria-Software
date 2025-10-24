// src/services/retryAxios.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Makes an axios request with automatic retry logic if the backend is unavailable.
 * Retries up to maxRetries times, with delayMs between attempts.
 */
export async function axiosWithRetry<T = any>(
  config: AxiosRequestConfig,
  maxRetries = 30,
  delayMs = 2000
): Promise<AxiosResponse<T>> {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await axios(config);
    } catch (error) {
      lastError = error;
      // Type guard for AxiosError
      const err = error as any;
      if (
        !err.response ||
        (err.response && err.response.status >= 500 && err.response.status < 600)
      ) {
        await new Promise(res => setTimeout(res, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}
