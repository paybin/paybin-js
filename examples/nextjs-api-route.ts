/**
 * Next.js API Route Example
 *
 * This example shows how to handle Paybin webhooks in Next.js
 *
 * Save this file as: pages/api/webhook.ts (Pages Router)
 * or: app/api/webhook/route.ts (App Router)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  verifyWebhook,
  parseDepositWebhook,
  DepositWebhookPayload
} from '@paybin/sdk';

// IMPORTANT: Disable Next.js body parser to read raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

type WebhookResponse = {
  success?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebhookResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read raw body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();

    // Get signature from headers
    const signature = req.headers['x-paybin-signature'] as string;

    if (!signature) {
      console.error('Missing webhook signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Verify webhook signature
    const isValid = verifyWebhook(
      body,
      signature,
      process.env.PAYBIN_SECRET_KEY!
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse webhook data
    const webhookData: DepositWebhookPayload = parseDepositWebhook(body);

    console.log('=== Paybin Webhook Received ===');
    console.log('Request ID:', webhookData.requestId);
    console.log('Symbol:', webhookData.symbol);
    console.log('Amount:', webhookData.amount);
    console.log('Transaction ID:', webhookData.txId);
    console.log('Status:', webhookData.status);
    console.log('Confirmations:', webhookData.confirmations);
    console.log('==============================\n');

    // Process the webhook based on status
    await processWebhook(webhookData);

    // Always return 200 OK to acknowledge receipt
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Process webhook data
async function processWebhook(webhook: DepositWebhookPayload) {
  switch (webhook.status) {
    case 'pending':
      console.log('Deposit pending...');
      // Update order status in database
      // await updateOrderStatus(webhook.referenceId, 'pending');
      break;

    case 'confirmed':
      console.log('Deposit confirmed! Processing order...');
      // Mark order as paid
      // await markOrderAsPaid(webhook.referenceId, {
      //   txId: webhook.txId,
      //   amount: webhook.amount,
      //   symbol: webhook.symbol
      // });

      // Send confirmation email
      // await sendConfirmationEmail(webhook.referenceId);

      // Fulfill order
      // await fulfillOrder(webhook.referenceId);
      break;

    case 'failed':
      console.log('Deposit failed');
      // Update order status
      // await updateOrderStatus(webhook.referenceId, 'failed');
      break;
  }
}
