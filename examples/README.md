# Paybin SDK Examples

This directory contains example implementations demonstrating various use cases of the Paybin SDK.

## Examples Overview

### 1. Basic Usage (`basic-usage.ts`)

Demonstrates fundamental operations:
- Creating deposit addresses
- Retrieving account balances
- Getting specific cryptocurrency balances
- Fetching existing deposit addresses

**Run:**
```bash
npx ts-node examples/basic-usage.ts
```

### 2. Withdrawal Flow (`withdrawal-flow.ts`)

Complete withdrawal process demonstration:
- Starting address verification
- Confirming verification amount
- Retrieving verified addresses
- Initiating withdrawals

Interactive example that guides you through each step.

**Run:**
```bash
npx ts-node examples/withdrawal-flow.ts
```

### 3. Express.js Webhook (`express-webhook.ts`)

Shows two methods for handling webhooks in Express.js:
- Manual webhook verification
- Using webhook middleware (recommended)

**Run:**
```bash
npx ts-node examples/express-webhook.ts
```

**Dependencies needed:**
```bash
npm install express @types/express
```

### 4. Next.js API Route (`nextjs-api-route.ts`)

Next.js API route implementation for webhook handling:
- Disabling body parser for raw body access
- Signature verification
- Processing webhook events

**Usage:**
Save as `pages/api/webhook.ts` in your Next.js project.

### 5. Error Handling (`error-handling.ts`)

Comprehensive error handling examples:
- Catching and handling `PaybinError`
- Specific error code handling
- Retry logic with exponential backoff
- Best practices for error recovery

**Run:**
```bash
npx ts-node examples/error-handling.ts
```

## Environment Setup

Create a `.env` file in the root directory:

```env
PAYBIN_PUBLIC_KEY=your_public_key_here
PAYBIN_SECRET_KEY=your_secret_key_here
PAYBIN_ENVIRONMENT=sandbox
```

## Prerequisites

Install dependencies:

```bash
# Install Paybin SDK
npm install @paybin/sdk

# Install TypeScript and ts-node for running examples
npm install -g typescript ts-node

# Install dotenv for environment variables
npm install dotenv
```

Load environment variables in examples:

```typescript
import 'dotenv/config';
```

## Common Use Cases

### Create Payment Flow

```typescript
// 1. User selects cryptocurrency
// 2. Create deposit address
const deposit = await paybin.deposit.createAddress({
  symbol: 'ETH',
  label: `Order ${orderId}`,
  referenceId: orderId,
  callbackUrl: 'https://yoursite.com/webhook',
  amount: 100,
  currency: 'USD'
});

// 3. Show address to user
console.log('Send', deposit.data.symbol, 'to:', deposit.data.wallet);

// 4. Wait for webhook notification
// 5. Confirm payment and fulfill order
```

### Check Balance Before Withdrawal

```typescript
// Check if sufficient balance exists
const balances = await paybin.balance.get();
const ethBalance = balances.data.ethBalance;

if (ethBalance >= withdrawalAmount) {
  // Proceed with withdrawal
  await paybin.withdraw.add({...});
} else {
  console.error('Insufficient balance');
}
```

### Verify Webhook Authenticity

```typescript
app.post('/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-paybin-signature'];
    const payload = req.body.toString();

    if (!verifyWebhook(payload, signature, secretKey)) {
      return res.status(401).send('Invalid signature');
    }

    // Process verified webhook
    const data = parseDepositWebhook(payload);
    // ... handle deposit
    res.status(200).send('OK');
  }
);
```

## Testing

Always use sandbox environment for testing:

```typescript
const paybin = new Paybin({
  publicKey: 'sandbox_public_key',
  secretKey: 'sandbox_secret_key',
  environment: 'sandbox'
});
```

## Tips

1. **Always verify webhooks** - Use signature verification to prevent fraud
2. **Handle all webhook statuses** - pending, confirmed, failed
3. **Use unique reference IDs** - Prevents duplicate transactions
4. **Implement retry logic** - Handle temporary network issues
5. **Log errors properly** - Include error codes and full context
6. **Test thoroughly** - Use sandbox before production
7. **Secure your keys** - Never commit API keys to version control

## Support

- Documentation: https://developers.paybin.io
- Dashboard: https://portfolio.paybin.io
- Issues: https://github.com/yourusername/paybin-sdk/issues
