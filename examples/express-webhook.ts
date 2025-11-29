/**
 * Express.js Webhook Example
 *
 * This example shows how to handle Paybin webhooks in an Express.js application
 */

import express from 'express';
import {
  verifyWebhook,
  parseDepositWebhook,
  createWebhookMiddleware,
  DepositWebhookPayload
} from '@paybin/sdk';

const app = express();
const PORT = process.env.PORT || 3000;

// Method 1: Manual webhook verification
app.post('/webhook/manual',
  express.raw({ type: 'application/json' }), // Important: use raw body parser
  (req, res) => {
    try {
      const signature = req.headers['x-paybin-signature'] as string;

      if (!signature) {
        return res.status(401).json({ error: 'Missing signature header' });
      }

      const payload = req.body.toString();

      // Verify webhook signature
      const isValid = verifyWebhook(
        payload,
        signature,
        process.env.PAYBIN_SECRET_KEY || 'your_secret_key'
      );

      if (!isValid) {
        console.log('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Parse webhook data
      const webhookData: DepositWebhookPayload = parseDepositWebhook(payload);

      console.log('=== Webhook Received (Manual) ===');
      console.log('Request ID:', webhookData.requestId);
      console.log('Symbol:', webhookData.symbol);
      console.log('Amount:', webhookData.amount);
      console.log('Transaction ID:', webhookData.txId);
      console.log('Status:', webhookData.status);
      console.log('Confirmations:', webhookData.confirmations);
      console.log('Timestamp:', webhookData.timestamp);

      // Process the deposit based on status
      switch (webhookData.status) {
        case 'pending':
          console.log('→ Deposit is pending confirmation');
          // Update order status to "payment pending"
          break;

        case 'confirmed':
          console.log('→ Deposit confirmed! Processing order...');
          // Update order status to "paid"
          // Fulfill the order
          // Send confirmation email
          break;

        case 'failed':
          console.log('→ Deposit failed');
          // Update order status to "payment failed"
          break;
      }

      console.log('================================\n');

      // Important: Always respond with 200 OK
      // Paybin will retry up to 3 times if no 200 response
      res.status(200).json({ success: true });

    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Method 2: Using webhook middleware (recommended)
app.post('/webhook/middleware',
  express.raw({ type: 'application/json' }),
  createWebhookMiddleware(process.env.PAYBIN_SECRET_KEY || 'your_secret_key'),
  (req, res) => {
    // Webhook is already verified and parsed by middleware
    const webhookData: DepositWebhookPayload = req.body;

    console.log('=== Webhook Received (Middleware) ===');
    console.log('Transaction:', webhookData.txId);
    console.log('Amount:', webhookData.amount, webhookData.symbol);
    console.log('Status:', webhookData.status);
    console.log('===================================\n');

    // Process the webhook
    processDeposit(webhookData);

    res.status(200).json({ success: true });
  }
);

// Business logic for processing deposits
async function processDeposit(webhook: DepositWebhookPayload) {
  // Example: Update database
  console.log(`Processing deposit for reference: ${webhook.referenceId}`);

  // Example: Send notification
  if (webhook.status === 'confirmed') {
    console.log('Sending confirmation email...');
    // await sendEmail(webhook);
  }

  // Example: Update order status
  // await updateOrderStatus(webhook.referenceId, webhook.status);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoints:`);
  console.log(`  - http://localhost:${PORT}/webhook/manual`);
  console.log(`  - http://localhost:${PORT}/webhook/middleware`);
  console.log(`\nMake sure to configure this URL in your Paybin dashboard.`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
