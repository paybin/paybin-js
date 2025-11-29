/**
 * @paybin/sdk - Official Paybin SDK for Node.js and TypeScript
 *
 * Easily integrate cryptocurrency payments into your application.
 * Supports Bitcoin, Ethereum, Litecoin, USDT, USDC, BNB, and more.
 *
 * @example
 * ```typescript
 * import { Paybin, NetworkId } from '@paybin/sdk';
 *
 * const paybin = new Paybin({
 *   publicKey: process.env.PAYBIN_PUBLIC_KEY,
 *   secretKey: process.env.PAYBIN_SECRET_KEY,
 *   environment: 'sandbox'
 * });
 *
 * // Create a deposit address
 * const deposit = await paybin.deposit.createAddress({
 *   symbol: 'ETH',
 *   label: 'User Payment',
 *   referenceId: 'ORDER-12345',
 *   callbackUrl: 'https://yoursite.com/webhook'
 * });
 * ```
 *
 * @packageDocumentation
 */

// Main SDK class
export { Paybin } from './paybin';

// Type exports
export * from './types';

// Utility exports
export {
  generateDepositHash,
  generateWithdrawHash,
  generateVerifyStartHash,
  generateVerifyConfirmHash,
  verifyWebhookSignature,
  generateWebhookSignature,
} from './utils/hash';

export {
  verifyWebhook,
  parseDepositWebhook,
  createWebhookMiddleware,
} from './utils/webhook';

// API class exports (for advanced usage)
export { DepositAPI } from './api/deposit';
export { WithdrawAPI } from './api/withdraw';
export { BalanceAPI } from './api/balance';
export { PaybinClient } from './client';

// Default export
export { Paybin as default } from './paybin';
