import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  PaybinConfig,
  PaybinResponse,
  PaybinError,
  PaybinErrorCode,
} from './types';

const BASE_URLS = {
  sandbox: 'https://sandbox.paybin.io',
  production: 'https://gateway.paybin.io',
};

export class PaybinClient {
  private axiosInstance: AxiosInstance;
  private publicKey: string;
  private secretKey: string;

  constructor(config: PaybinConfig) {
    this.publicKey = config.publicKey;
    this.secretKey = config.secretKey;

    const baseURL = BASE_URLS[config.environment || 'sandbox'];

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.secretKey,
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<PaybinResponse<any>>) => {
        if (error.response) {
          const { data, status } = error.response;

          throw new PaybinError(
            data?.message || 'An error occurred',
            data?.code || status,
            status,
            data
          );
        }

        if (error.request) {
          throw new PaybinError(
            'No response received from server',
            0,
            0
          );
        }

        throw new PaybinError(
          error.message || 'An error occurred',
          0,
          0
        );
      }
    );
  }

  async post<T>(endpoint: string, data: any): Promise<PaybinResponse<T>> {
    const response = await this.axiosInstance.post<PaybinResponse<T>>(
      endpoint,
      data
    );

    if (response.data.code !== 200) {
      throw new PaybinError(
        response.data.message,
        response.data.code,
        response.status,
        response.data
      );
    }

    return response.data;
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  getSecretKey(): string {
    return this.secretKey;
  }
}
