import CryptoJS from 'crypto-js';
import {
  CreateDepositHashInput,
  WithdrawHashInput,
  VerifyStartHashInput,
  VerifyConfirmHashInput,
} from '../types';

/**
 * Generates MD5 hash for deposit address creation
 * Hash formula: MD5(PublicKey + Symbol + Label + ReferenceId + CallbackUrl + SecretKey)
 */
export function generateDepositHash(
  input: CreateDepositHashInput,
  secretKey: string
): string {
  const hashString =
    input.publicKey +
    input.symbol +
    input.label +
    input.referenceId +
    input.callbackUrl +
    secretKey;

  return CryptoJS.MD5(hashString).toString();
}

/**
 * Generates MD5 hash for withdraw request
 * Hash formula: MD5(Symbol + Amount + Address + MerchantTransactionId + SecretKey)
 */
export function generateWithdrawHash(
  input: WithdrawHashInput,
  secretKey: string
): string {
  const hashString =
    input.symbol +
    input.amount.toString() +
    input.address +
    input.merchantTransactionId +
    secretKey;

  return CryptoJS.MD5(hashString).toString();
}

/**
 * Generates MD5 hash for verify start request
 * Hash formula: MD5(Symbol + NetworkId + Address + ReferenceId + SecretKey)
 */
export function generateVerifyStartHash(
  input: VerifyStartHashInput,
  secretKey: string
): string {
  const hashString =
    input.symbol +
    input.networkId.toString() +
    input.address +
    input.referenceId +
    secretKey;

  return CryptoJS.MD5(hashString).toString();
}

/**
 * Generates MD5 hash for verify confirm amount request
 * Hash formula: MD5(Symbol + NetworkId + Amount + ReferenceId + SecretKey)
 */
export function generateVerifyConfirmHash(
  input: VerifyConfirmHashInput,
  secretKey: string
): string {
  const hashString =
    input.symbol +
    input.networkId.toString() +
    input.amount.toString() +
    input.referenceId +
    secretKey;

  return CryptoJS.MD5(hashString).toString();
}

/**
 * Verifies webhook signature using HMAC-SHA256
 * This should be used to verify incoming webhook requests from Paybin
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  const expectedSignature = CryptoJS.HmacSHA256(payload, secretKey).toString();
  return signature === expectedSignature;
}

/**
 * Generates webhook signature for testing purposes
 */
export function generateWebhookSignature(
  payload: string,
  secretKey: string
): string {
  return CryptoJS.HmacSHA256(payload, secretKey).toString();
}
