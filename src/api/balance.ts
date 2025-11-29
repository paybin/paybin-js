import { PaybinClient } from '../client';
import {
  GetBalanceRequest,
  BalanceResponse,
  PaybinResponse,
} from '../types';

export class BalanceAPI {
  constructor(private client: PaybinClient) {}

  /**
   * Retrieves account balances for all supported cryptocurrencies
   * @returns Promise with balance information
   *
   * @example
   * ```typescript
   * const balances = await paybin.balance.get();
   * console.log('BTC Balance:', balances.data.btcBalance);
   * console.log('ETH Balance:', balances.data.ethBalance);
   * console.log('USDT Balance:', balances.data.usdtBalance);
   * ```
   */
  async get(): Promise<PaybinResponse<BalanceResponse>> {
    const request: GetBalanceRequest = {
      PublicKey: this.client.getPublicKey(),
    };

    return this.client.post<BalanceResponse>('/v1/merchant/balances', request);
  }

  /**
   * Gets balance for a specific cryptocurrency
   * @param symbol - The cryptocurrency symbol (e.g., 'BTC', 'ETH')
   * @returns Promise with the balance value
   *
   * @example
   * ```typescript
   * const btcBalance = await paybin.balance.getBySymbol('btc');
   * console.log('BTC Balance:', btcBalance);
   * ```
   */
  async getBySymbol(
    symbol: 'btc' | 'eth' | 'ltc' | 'bnb' | 'usdt' | 'bscusd' | 'trx' | 'trxusd' | 'optusd' | 'opteth' | 'ethusdc' | 'bscusdc'
  ): Promise<number> {
    const response = await this.get();
    const balanceKey = `${symbol}Balance` as keyof BalanceResponse;
    return response.data?.[balanceKey] || 0;
  }
}
