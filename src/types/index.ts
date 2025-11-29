/**
 * Paybin SDK Type Definitions
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface PaybinConfig {
  publicKey: string;
  secretKey: string;
  environment?: 'sandbox' | 'production';
}

export type Environment = 'sandbox' | 'production';

// ============================================================================
// Common Types
// ============================================================================

export interface PaybinResponse<T> {
  apiVersion: string;
  data: T | null;
  code: number;
  message: string;
}

export type CryptoSymbol = 'BTC' | 'ETH' | 'LTC' | 'USDT' | 'USDC' | 'BNB' | 'TRX';

export type FiatCurrency = 'USD' | 'EUR' | 'TRY' | 'GBP';

export enum NetworkId {
  BitcoinMainnet = 1,
  LitecoinMainnet = 2,
  EthereumMainnet = 3,
  BinanceSmartChain = 4,
  OptimismMainnet = 5,
  TronMainnet = 6,
}

export interface PriceInfo {
  usd?: number;
  eur?: number;
  try?: number;
  gbp?: number;
}

// ============================================================================
// Deposit Types
// ============================================================================

export interface CreateDepositAddressRequest {
  PublicKey: string;
  Symbol: CryptoSymbol;
  Label: string;
  ReferenceId: string;
  CallbackUrl: string;
  Amount?: number;
  Currency?: FiatCurrency;
  RedirectUrl?: string;
  CancelUrl?: string;
  Hash: string;
}

export interface CreateDepositAddressResponse {
  wallet: string;
  requestId: string;
  symbol: CryptoSymbol;
  network: string;
  price?: PriceInfo;
}

export interface GetDepositAddressRequest {
  PublicKey: string;
  MemberId: string;
  Symbol: CryptoSymbol;
  Label?: string;
  NetworkId?: NetworkId;
}

export interface GetDepositAddressResponse {
  memberWalletId: number;
  address: string;
  symbol: CryptoSymbol;
  network: string;
}

export interface DepositWebhookPayload {
  requestId: string;
  symbol: CryptoSymbol;
  amount: number;
  txId: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: string;
  referenceId?: string;
}

// ============================================================================
// Withdraw Types
// ============================================================================

export interface WithdrawRequest {
  PublicKey: string;
  ReferenceId: string;
  Amount: number;
  Symbol: CryptoSymbol;
  NetworkId: NetworkId;
  Address: string;
  Label: string;
  MerchantTransactionId: string;
  Hash: string;
  TfaCode: string;
  Email: string;
}

export interface WithdrawResponse {
  txId: string;
  explorerUrl: string;
  success: boolean;
}

export interface VerifyStartRequest {
  PublicKey: string;
  ReferenceId: string;
  Symbol: CryptoSymbol;
  NetworkId: NetworkId;
  Address: string;
  Label: string;
  Hash: string;
}

export interface VerifyStartResponse {
  txId: string;
  amount: number;
}

export interface VerifyConfirmAmountRequest {
  PublicKey: string;
  ReferenceId: string;
  Symbol: CryptoSymbol;
  NetworkId: NetworkId;
  Amount: number;
  Hash: string;
}

export interface VerifyConfirmAmountResponse {
  isVerified: boolean;
}

export interface GetWithdrawableAssetsRequest {
  PublicKey: string;
  ReferenceId: string;
}

export interface WithdrawableAsset {
  symbol: CryptoSymbol;
  networkId: NetworkId;
  referenceId: string;
  address: string;
}

export type GetWithdrawableAssetsResponse = WithdrawableAsset[];

// ============================================================================
// Balance Types
// ============================================================================

export interface GetBalanceRequest {
  PublicKey: string;
}

export interface BalanceResponse {
  btcBalance: number;
  ethBalance: number;
  ltcBalance: number;
  bnbBalance: number;
  usdtBalance: number;
  bscusdBalance: number;
  trxBalance: number;
  trxusdBalance: number;
  optusdBalance: number;
  optethBalance: number;
  ethusdcBalance: number;
  bscusdcBalance: number;
}

// ============================================================================
// Error Types
// ============================================================================

export enum PaybinErrorCode {
  Z100 = 'Z100', // An error occurred
  Z200 = 'Z200', // Invalid credentials
  Z202 = 'Z202', // Invalid TFA Code
  Z204 = 'Z204', // Invalid fingerprint/hash
  Z206 = 'Z206', // Account blocked
  Z300 = 'Z300', // Invalid symbol
  Z400 = 'Z400', // Blockchain network error
  Z500 = 'Z500', // No wallet configured
  Z501 = 'Z501', // Already executed
  Z502 = 'Z502', // Duplicate reference ID
  Z503 = 'Z503', // Duplicate reference ID
  Z504 = 'Z504', // Duplicate reference ID
  Z507 = 'Z507', // Amount insufficient
  Z509 = 'Z509', // Awaiting email approval
  Z511 = 'Z511', // Invalid address
  Z513 = 'Z513', // Insufficient balance
  Z514 = 'Z514', // Insufficient balance
  Z519 = 'Z519', // Duplicate request
  Z529 = 'Z529', // SMS verification needed
  Z531 = 'Z531', // Invalid SMS code
  Z533 = 'Z533', // IP not whitelisted
  Z540 = 'Z540', // Address limit reached
  Z600 = 'Z600', // Invalid parameters
  Z700 = 'Z700', // CAPTCHA required
  Z800 = 'Z800', // Invalid body hash
  Z900 = 'Z900', // Token expired
}

export class PaybinError extends Error {
  code: PaybinErrorCode | number;
  httpStatus: number;
  response?: PaybinResponse<any>;

  constructor(
    message: string,
    code: PaybinErrorCode | number,
    httpStatus: number,
    response?: PaybinResponse<any>
  ) {
    super(message);
    this.name = 'PaybinError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.response = response;
  }
}

// ============================================================================
// Hash Generation Input Types
// ============================================================================

export interface CreateDepositHashInput {
  publicKey: string;
  symbol: CryptoSymbol;
  label: string;
  referenceId: string;
  callbackUrl: string;
}

export interface WithdrawHashInput {
  symbol: CryptoSymbol;
  amount: number;
  address: string;
  merchantTransactionId: string;
}

export interface VerifyStartHashInput {
  symbol: CryptoSymbol;
  networkId: NetworkId;
  address: string;
  referenceId: string;
}

export interface VerifyConfirmHashInput {
  symbol: CryptoSymbol;
  networkId: NetworkId;
  amount: number;
  referenceId: string;
}
