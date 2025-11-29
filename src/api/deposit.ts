import { PaybinClient } from '../client';
import {
  CreateDepositAddressRequest,
  CreateDepositAddressResponse,
  GetDepositAddressRequest,
  GetDepositAddressResponse,
  CryptoSymbol,
  FiatCurrency,
  NetworkId,
  PaybinResponse,
} from '../types';
import { generateDepositHash } from '../utils/hash';

export class DepositAPI {
  constructor(private client: PaybinClient) {}

  /**
   * Creates a new deposit address for receiving cryptocurrency
   * @param params - Deposit address creation parameters
   * @returns Promise with wallet address and request details
   *
   * @example
   * ```typescript
   * const deposit = await paybin.deposit.createAddress({
   *   symbol: 'ETH',
   *   label: 'User 12345',
   *   referenceId: 'ORDER-12345',
   *   callbackUrl: 'https://yoursite.com/webhook',
   *   amount: 100,
   *   currency: 'USD'
   * });
   * console.log('Deposit address:', deposit.data.wallet);
   * ```
   */
  async createAddress(params: {
    symbol: CryptoSymbol;
    label: string;
    referenceId: string;
    callbackUrl: string;
    amount?: number;
    currency?: FiatCurrency;
    redirectUrl?: string;
    cancelUrl?: string;
  }): Promise<PaybinResponse<CreateDepositAddressResponse>> {
    const hash = generateDepositHash(
      {
        publicKey: this.client.getPublicKey(),
        symbol: params.symbol,
        label: params.label,
        referenceId: params.referenceId,
        callbackUrl: params.callbackUrl,
      },
      this.client.getSecretKey()
    );

    const request: CreateDepositAddressRequest = {
      PublicKey: this.client.getPublicKey(),
      Symbol: params.symbol,
      Label: params.label,
      ReferenceId: params.referenceId,
      CallbackUrl: params.callbackUrl,
      Hash: hash,
      ...(params.amount && { Amount: params.amount }),
      ...(params.currency && { Currency: params.currency }),
      ...(params.redirectUrl && { RedirectUrl: params.redirectUrl }),
      ...(params.cancelUrl && { CancelUrl: params.cancelUrl }),
    };

    return this.client.post<CreateDepositAddressResponse>(
      '/v1/deposit/address/create',
      request
    );
  }

  /**
   * Retrieves an existing deposit address
   * @param params - Parameters to identify the deposit address
   * @returns Promise with deposit address details
   *
   * @example
   * ```typescript
   * const address = await paybin.deposit.getAddress({
   *   memberId: 'USER-12345',
   *   symbol: 'ETH',
   *   label: 'Main Wallet'
   * });
   * console.log('Address:', address.data.address);
   * ```
   */
  async getAddress(params: {
    memberId: string;
    symbol: CryptoSymbol;
    label?: string;
    networkId?: NetworkId;
  }): Promise<PaybinResponse<GetDepositAddressResponse>> {
    const request: GetDepositAddressRequest = {
      PublicKey: this.client.getPublicKey(),
      MemberId: params.memberId,
      Symbol: params.symbol,
      ...(params.label && { Label: params.label }),
      ...(params.networkId && { NetworkId: params.networkId }),
    };

    return this.client.post<GetDepositAddressResponse>(
      '/v1/deposit/address/get',
      request
    );
  }
}
