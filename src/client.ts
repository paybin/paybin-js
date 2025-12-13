import axios, { AxiosInstance, AxiosError } from 'axios';
import { createSign } from 'crypto';
import { readFileSync } from 'fs';
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
  private signaturePrivateKey?: string;

  constructor(config: PaybinConfig) {
    this.publicKey = config.publicKey;
    this.secretKey = config.secretKey;
    this.signaturePrivateKey = this.loadSignaturePrivateKey(config);

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

  private loadSignaturePrivateKey(config: PaybinConfig): string | undefined {
    if (!config.signature) {
      return undefined;
    }

    const { key, path, env } = config.signature;

    // Priority: key > path > env
    if (key) {
      return key;
    }

    if (path) {
      try {
        return readFileSync(path, 'utf-8');
      } catch (error) {
        throw new Error(`Failed to read signature private key from path: ${path}`);
      }
    }

    const envName = env || 'PAYBIN_SIGNATURE_PRIVATE_KEY';
    const envValue = process.env[envName];

    if (envValue) {
      return envValue;
    }

    if (env) {
      throw new Error(`Environment variable ${envName} is not set`);
    }

    return undefined;
  }

  private signPayload(payload: string): string {
    if (!this.signaturePrivateKey) {
      throw new Error('Signature private key is not configured');
    }

    const sign = createSign('RSA-SHA512');
    sign.update(payload);
    sign.end();

    return sign.sign(this.signaturePrivateKey, 'base64');
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
    const payload = JSON.stringify(data);
    const headers: Record<string, string> = {};

    if (this.signaturePrivateKey) {
      headers['X-Signature'] = this.signPayload(payload);
    }

    const response = await this.axiosInstance.post<PaybinResponse<T>>(
      endpoint,
      data,
      { headers }
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
