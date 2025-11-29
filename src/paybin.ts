import { PaybinClient } from './client';
import { DepositAPI } from './api/deposit';
import { WithdrawAPI } from './api/withdraw';
import { BalanceAPI } from './api/balance';
import { PaybinConfig } from './types';

/**
 * Main Paybin SDK class
 *
 * @example
 * ```typescript
 * import { Paybin } from '@paybin/sdk';
 *
 * const paybin = new Paybin({
 *   publicKey: 'your-public-key',
 *   secretKey: 'your-secret-key',
 *   environment: 'sandbox' // or 'production'
 * });
 *
 * // Create deposit address
 * const deposit = await paybin.deposit.createAddress({
 *   symbol: 'ETH',
 *   label: 'User 12345',
 *   referenceId: 'ORDER-12345',
 *   callbackUrl: 'https://yoursite.com/webhook'
 * });
 *
 * // Check balances
 * const balances = await paybin.balance.get();
 *
 * // Initiate withdrawal
 * const withdrawal = await paybin.withdraw.add({
 *   referenceId: 'USER-12345',
 *   amount: 0.1,
 *   symbol: 'ETH',
 *   networkId: NetworkId.EthereumMainnet,
 *   address: '0x...',
 *   label: 'Withdrawal',
 *   merchantTransactionId: 'WITHDRAW-001',
 *   tfaCode: '123456',
 *   email: 'user@example.com'
 * });
 * ```
 */
export class Paybin {
  private client: PaybinClient;

  public deposit: DepositAPI;
  public withdraw: WithdrawAPI;
  public balance: BalanceAPI;

  /**
   * Creates a new Paybin SDK instance
   * @param config - Configuration object with API keys and environment
   */
  constructor(config: PaybinConfig) {
    this.client = new PaybinClient(config);

    this.deposit = new DepositAPI(this.client);
    this.withdraw = new WithdrawAPI(this.client);
    this.balance = new BalanceAPI(this.client);
  }

  /**
   * Gets the current environment (sandbox or production)
   */
  getEnvironment(): 'sandbox' | 'production' {
    return this.client.getPublicKey().startsWith('sandbox_')
      ? 'sandbox'
      : 'production';
  }
}
