import { PaybinClient } from '../client';
import {
  WithdrawRequest,
  WithdrawResponse,
  VerifyStartRequest,
  VerifyStartResponse,
  VerifyConfirmAmountRequest,
  VerifyConfirmAmountResponse,
  GetWithdrawableAssetsRequest,
  GetWithdrawableAssetsResponse,
  CryptoSymbol,
  NetworkId,
  PaybinResponse,
} from '../types';
import {
  generateWithdrawHash,
  generateVerifyStartHash,
  generateVerifyConfirmHash,
} from '../utils/hash';

export class WithdrawAPI {
  constructor(private client: PaybinClient) {}

  /**
   * Initiates a withdrawal request
   * @param params - Withdrawal parameters
   * @returns Promise with transaction details
   *
   * @example
   * ```typescript
   * const withdrawal = await paybin.withdraw.add({
   *   referenceId: 'USER-12345',
   *   amount: 0.1,
   *   symbol: 'ETH',
   *   networkId: NetworkId.EthereumMainnet,
   *   address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
   *   label: 'Withdrawal to personal wallet',
   *   merchantTransactionId: 'WITHDRAW-001',
   *   tfaCode: '123456',
   *   email: 'user@example.com'
   * });
   * console.log('Transaction ID:', withdrawal.data.txId);
   * ```
   */
  async add(params: {
    referenceId: string;
    amount: number;
    symbol: CryptoSymbol;
    networkId: NetworkId;
    address: string;
    label: string;
    merchantTransactionId: string;
    tfaCode: string;
    email: string;
  }): Promise<PaybinResponse<WithdrawResponse>> {
    const hash = generateWithdrawHash(
      {
        symbol: params.symbol,
        amount: params.amount,
        address: params.address,
        merchantTransactionId: params.merchantTransactionId,
      },
      this.client.getSecretKey()
    );

    const request: WithdrawRequest = {
      PublicKey: this.client.getPublicKey(),
      ReferenceId: params.referenceId,
      Amount: params.amount,
      Symbol: params.symbol,
      NetworkId: params.networkId,
      Address: params.address,
      Label: params.label,
      MerchantTransactionId: params.merchantTransactionId,
      Hash: hash,
      TfaCode: params.tfaCode,
      Email: params.email,
    };

    return this.client.post<WithdrawResponse>('/v1/withdraw/add', request);
  }

  /**
   * Starts the address verification process
   * Paybin will send a small amount to verify wallet ownership
   * @param params - Verification parameters
   * @returns Promise with verification transaction details
   *
   * @example
   * ```typescript
   * const verification = await paybin.withdraw.verifyStart({
   *   referenceId: 'USER-12345',
   *   symbol: 'ETH',
   *   networkId: NetworkId.EthereumMainnet,
   *   address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
   *   label: 'My Wallet'
   * });
   * console.log('Verification amount:', verification.data.amount);
   * ```
   */
  async verifyStart(params: {
    referenceId: string;
    symbol: CryptoSymbol;
    networkId: NetworkId;
    address: string;
    label: string;
  }): Promise<PaybinResponse<VerifyStartResponse>> {
    const hash = generateVerifyStartHash(
      {
        symbol: params.symbol,
        networkId: params.networkId,
        address: params.address,
        referenceId: params.referenceId,
      },
      this.client.getSecretKey()
    );

    const request: VerifyStartRequest = {
      PublicKey: this.client.getPublicKey(),
      ReferenceId: params.referenceId,
      Symbol: params.symbol,
      NetworkId: params.networkId,
      Address: params.address,
      Label: params.label,
      Hash: hash,
    };

    return this.client.post<VerifyStartResponse>('/v1/verify/start', request);
  }

  /**
   * Confirms the verification amount received
   * @param params - Confirmation parameters with the exact amount received
   * @returns Promise with verification status
   *
   * @example
   * ```typescript
   * const result = await paybin.withdraw.verifyConfirmAmount({
   *   referenceId: 'USER-12345',
   *   symbol: 'ETH',
   *   networkId: NetworkId.EthereumMainnet,
   *   amount: 0.00004912
   * });
   * console.log('Verified:', result.data.isVerified);
   * ```
   */
  async verifyConfirmAmount(params: {
    referenceId: string;
    symbol: CryptoSymbol;
    networkId: NetworkId;
    amount: number;
  }): Promise<PaybinResponse<VerifyConfirmAmountResponse>> {
    const hash = generateVerifyConfirmHash(
      {
        symbol: params.symbol,
        networkId: params.networkId,
        amount: params.amount,
        referenceId: params.referenceId,
      },
      this.client.getSecretKey()
    );

    const request: VerifyConfirmAmountRequest = {
      PublicKey: this.client.getPublicKey(),
      ReferenceId: params.referenceId,
      Symbol: params.symbol,
      NetworkId: params.networkId,
      Amount: params.amount,
      Hash: hash,
    };

    return this.client.post<VerifyConfirmAmountResponse>(
      '/v1/verify/confirmAmount',
      request
    );
  }

  /**
   * Fetches all verified withdrawal addresses
   * @param referenceId - Reference identifier
   * @returns Promise with list of withdrawable assets
   *
   * @example
   * ```typescript
   * const assets = await paybin.withdraw.getWithdrawableAssets('USER-12345');
   * console.log('Verified addresses:', assets.data);
   * ```
   */
  async getWithdrawableAssets(
    referenceId: string
  ): Promise<PaybinResponse<GetWithdrawableAssetsResponse>> {
    const request: GetWithdrawableAssetsRequest = {
      PublicKey: this.client.getPublicKey(),
      ReferenceId: referenceId,
    };

    return this.client.post<GetWithdrawableAssetsResponse>(
      '/v1/merchant/withdraw/withdrawableAssets',
      request
    );
  }
}
