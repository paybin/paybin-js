import { verifyWebhookSignature } from './hash';
import { DepositWebhookPayload } from '../types';

/**
 * Verifies the authenticity of a webhook request from Paybin
 * @param payload - The raw JSON string payload from the webhook
 * @param signature - The signature from the webhook headers (X-Paybin-Signature)
 * @param secretKey - Your Paybin secret key
 * @returns True if the signature is valid, false otherwise
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { verifyWebhook } from '@paybin/sdk';
 *
 * app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
 *   const signature = req.headers['x-paybin-signature'] as string;
 *   const payload = req.body.toString();
 *
 *   if (!verifyWebhook(payload, signature, process.env.PAYBIN_SECRET_KEY)) {
 *     return res.status(401).send('Invalid signature');
 *   }
 *
 *   const data = JSON.parse(payload);
 *   // Process webhook data
 *   res.status(200).send('OK');
 * });
 * ```
 */
export function verifyWebhook(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  return verifyWebhookSignature(payload, signature, secretKey);
}

/**
 * Parses and validates a deposit webhook payload
 * @param payload - The webhook payload (can be string or object)
 * @returns Parsed and typed webhook payload
 *
 * @example
 * ```typescript
 * const webhookData = parseDepositWebhook(req.body);
 * console.log('Deposit confirmed:', webhookData.txId);
 * console.log('Amount:', webhookData.amount, webhookData.symbol);
 * ```
 */
export function parseDepositWebhook(
  payload: string | DepositWebhookPayload
): DepositWebhookPayload {
  if (typeof payload === 'string') {
    return JSON.parse(payload) as DepositWebhookPayload;
  }
  return payload;
}

/**
 * Express middleware for verifying Paybin webhooks
 * @param secretKey - Your Paybin secret key
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { createWebhookMiddleware } from '@paybin/sdk';
 *
 * const app = express();
 *
 * app.post('/webhook',
 *   express.raw({ type: 'application/json' }),
 *   createWebhookMiddleware(process.env.PAYBIN_SECRET_KEY),
 *   (req, res) => {
 *     const webhookData = req.body;
 *     // Process verified webhook
 *     res.status(200).send('OK');
 *   }
 * );
 * ```
 */
export function createWebhookMiddleware(secretKey: string) {
  return (req: any, res: any, next: any) => {
    const signature = req.headers['x-paybin-signature'] as string;

    if (!signature) {
      return res.status(401).json({ error: 'Missing signature header' });
    }

    const payload = req.body.toString();

    if (!verifyWebhook(payload, signature, secretKey)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    try {
      req.body = parseDepositWebhook(payload);
      next();
    } catch (error) {
      return res.status(400).json({ error: 'Invalid payload format' });
    }
  };
}
