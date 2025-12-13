# @paybin/sdk

Official Paybin SDK for Node.js and TypeScript - Easily integrate cryptocurrency payments into your application.

[![npm version](https://badge.fury.io/js/%40paybin%2Fsdk.svg)](https://www.npmjs.com/package/@paybin/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Full TypeScript Support** - Complete type definitions for all API methods and responses
- **Easy Integration** - Simple, intuitive API for cryptocurrency payments
- **Multi-Currency** - Support for BTC, ETH, LTC, USDT, USDC, BNB, TRX
- **Multi-Network** - Bitcoin, Ethereum, Litecoin, BSC, Optimism, Tron networks
- **Webhook Support** - Built-in webhook verification and parsing utilities
- **Secure** - Automatic hash generation and signature verification
- **Promise-based** - Modern async/await API
- **Sandbox & Production** - Easy switching between environments

## Installation

```bash
npm install @paybin/sdk
```

or

```bash
yarn add @paybin/sdk
```

## Quick Start

```typescript
import { Paybin, NetworkId } from '@paybin/sdk';

// Initialize the SDK
const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY!,
  secretKey: process.env.PAYBIN_SECRET_KEY!,
  environment: 'sandbox' // or 'production'
});

// Create a deposit address
const deposit = await paybin.deposit.createAddress({
  symbol: 'ETH',
  label: 'User Payment',
  referenceId: 'ORDER-12345',
  callbackUrl: 'https://yoursite.com/webhook'
});

console.log('Deposit address:', deposit.data.wallet);
console.log('Request ID:', deposit.data.requestId);
```

## API Documentation

### Configuration

```typescript
interface PaybinConfig {
  publicKey: string;      // Your Paybin public key
  secretKey: string;      // Your Paybin secret key
  environment?: 'sandbox' | 'production'; // Default: 'sandbox'
  signature?: {           // Optional: RS512 request signing
    key?: string;         // PEM-formatted private key
    path?: string;        // File path to PEM key file
    env?: string;         // Environment variable name (default: PAYBIN_SIGNATURE_PRIVATE_KEY)
  };
}
```

Get your API keys from [Paybin Portfolio](https://portfolio.paybin.io).

### Request Signing (RS512)

For enhanced security, you can sign all requests with RS512. When configured, every request will include an `X-Signature` header containing the RS512 signature of the request body.

```typescript
const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY!,
  secretKey: process.env.PAYBIN_SECRET_KEY!,
  environment: 'production',
  signature: { env: 'PAYBIN_SIGNATURE_PRIVATE_KEY' }
});
```

See [Request Signing Security](#request-signing-security) for detailed configuration options.

---

## Deposit API

### Create Deposit Address

Creates a unique cryptocurrency deposit address for receiving payments.

```typescript
const deposit = await paybin.deposit.createAddress({
  symbol: 'ETH',                              // Required: BTC, ETH, LTC, USDT, USDC, BNB, TRX
  label: 'User 12345',                        // Required: Identifier for the deposit
  referenceId: 'ORDER-12345',                 // Required: Unique reference ID
  callbackUrl: 'https://yoursite.com/webhook', // Required: Webhook URL for notifications
  amount: 100,                                // Optional: Expected amount in fiat
  currency: 'USD',                            // Optional: USD, EUR, TRY, GBP
  redirectUrl: 'https://yoursite.com/success', // Optional: Success redirect
  cancelUrl: 'https://yoursite.com/cancel'    // Optional: Cancel redirect
});

console.log(deposit.data);
// {
//   wallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
//   requestId: '550e8400-e29b-41d4-a716-446655440000',
//   symbol: 'ETH',
//   network: 'Ethereum Mainnet',
//   price: { usd: 2500.00, eur: 2200.00 }
// }
```

### Get Deposit Address

Retrieves an existing deposit address.

```typescript
const address = await paybin.deposit.getAddress({
  memberId: 'USER-12345',      // Required: Unique member identifier
  symbol: 'ETH',               // Required: Cryptocurrency symbol
  label: 'Main Wallet',        // Optional: Address label
  networkId: NetworkId.EthereumMainnet // Optional: Specific network
});

console.log(address.data.address);
```

---

## Withdraw API

### Add Withdrawal Request

Initiates a cryptocurrency withdrawal.

```typescript
const withdrawal = await paybin.withdraw.add({
  referenceId: 'USER-12345',
  amount: 0.1,
  symbol: 'ETH',
  networkId: NetworkId.EthereumMainnet,
  address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  label: 'Withdrawal to personal wallet',
  merchantTransactionId: 'WITHDRAW-001',
  tfaCode: '123456',                        // Two-factor authentication code
  email: 'user@example.com'
});

console.log(withdrawal.data);
// {
//   txId: '0xd6471185...52ac3d443f2dca79cc56f576e2ca158',
//   explorerUrl: 'https://etherscan.io/tx/0xd6471185...',
//   success: true
// }
```

### Verify Withdrawal Address (Start)

Starts the address verification process. Paybin sends a small amount to verify wallet ownership.

```typescript
const verification = await paybin.withdraw.verifyStart({
  referenceId: 'USER-12345',
  symbol: 'ETH',
  networkId: NetworkId.EthereumMainnet,
  address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  label: 'My Wallet'
});

console.log('Verification amount sent:', verification.data.amount);
// User should check their wallet for this exact amount
```

### Verify Withdrawal Address (Confirm)

Confirms the verification amount to complete address verification.

```typescript
const result = await paybin.withdraw.verifyConfirmAmount({
  referenceId: 'USER-12345',
  symbol: 'ETH',
  networkId: NetworkId.EthereumMainnet,
  amount: 0.00004912  // Exact amount received from verification
});

console.log('Verified:', result.data.isVerified); // true
```

### Get Withdrawable Assets

Fetches all verified withdrawal addresses.

```typescript
const assets = await paybin.withdraw.getWithdrawableAssets('USER-12345');

assets.data.forEach(asset => {
  console.log(`${asset.symbol} on network ${asset.networkId}: ${asset.address}`);
});
```

---

## Balance API

### Get All Balances

Retrieves account balances for all supported cryptocurrencies.

```typescript
const balances = await paybin.balance.get();

console.log('BTC Balance:', balances.data.btcBalance);
console.log('ETH Balance:', balances.data.ethBalance);
console.log('USDT Balance:', balances.data.usdtBalance);
console.log('USDC Balance:', balances.data.ethusdcBalance);
```

### Get Balance by Symbol

Gets balance for a specific cryptocurrency.

```typescript
const btcBalance = await paybin.balance.getBySymbol('btc');
const ethBalance = await paybin.balance.getBySymbol('eth');
const usdtBalance = await paybin.balance.getBySymbol('usdt');
```

---

## Webhooks

Paybin sends webhook notifications for deposit events. Verify webhook signatures to ensure authenticity.

### Express.js Example

```typescript
import express from 'express';
import { verifyWebhook, parseDepositWebhook } from '@paybin/sdk';

const app = express();

app.post('/webhook',
  express.raw({ type: 'application/json' }), // Important: use raw body
  (req, res) => {
    const signature = req.headers['x-paybin-signature'] as string;
    const payload = req.body.toString();

    // Verify webhook signature
    if (!verifyWebhook(payload, signature, process.env.PAYBIN_SECRET_KEY!)) {
      return res.status(401).send('Invalid signature');
    }

    // Parse webhook data
    const webhookData = parseDepositWebhook(payload);

    console.log('Deposit received:');
    console.log('  Transaction ID:', webhookData.txId);
    console.log('  Amount:', webhookData.amount, webhookData.symbol);
    console.log('  Status:', webhookData.status);
    console.log('  Confirmations:', webhookData.confirmations);

    // Process the deposit
    // ... your business logic here ...

    // Respond with 200 to acknowledge receipt
    res.status(200).send('OK');
  }
);
```

### Using Webhook Middleware

```typescript
import { createWebhookMiddleware } from '@paybin/sdk';

app.post('/webhook',
  express.raw({ type: 'application/json' }),
  createWebhookMiddleware(process.env.PAYBIN_SECRET_KEY!),
  (req, res) => {
    // Webhook is already verified and parsed
    const webhookData = req.body;

    console.log('Verified deposit:', webhookData);

    res.status(200).send('OK');
  }
);
```

### Next.js API Route Example

```typescript
// pages/api/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyWebhook, parseDepositWebhook } from '@paybin/sdk';

export const config = {
  api: {
    bodyParser: false, // Important: disable body parser
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read raw body
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString();

  const signature = req.headers['x-paybin-signature'] as string;

  // Verify signature
  if (!verifyWebhook(body, signature, process.env.PAYBIN_SECRET_KEY!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const webhookData = parseDepositWebhook(body);

  // Process the deposit
  console.log('Deposit received:', webhookData);

  res.status(200).json({ success: true });
}
```

---

## Network IDs

```typescript
import { NetworkId } from '@paybin/sdk';

NetworkId.BitcoinMainnet    // 1
NetworkId.LitecoinMainnet   // 2
NetworkId.EthereumMainnet   // 3
NetworkId.BinanceSmartChain // 4
NetworkId.OptimismMainnet   // 5
NetworkId.TronMainnet       // 6
```

---

## Error Handling

The SDK throws `PaybinError` for API errors with detailed information.

```typescript
import { Paybin, PaybinError, PaybinErrorCode } from '@paybin/sdk';

try {
  const deposit = await paybin.deposit.createAddress({
    symbol: 'ETH',
    label: 'Test',
    referenceId: 'REF-001',
    callbackUrl: 'https://example.com/webhook'
  });
} catch (error) {
  if (error instanceof PaybinError) {
    console.error('Paybin Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('HTTP Status:', error.httpStatus);

    // Handle specific errors
    switch (error.code) {
      case PaybinErrorCode.Z200:
        console.error('Invalid credentials');
        break;
      case PaybinErrorCode.Z300:
        console.error('Invalid symbol');
        break;
      case PaybinErrorCode.Z800:
        console.error('Invalid body hash');
        break;
      default:
        console.error('Unknown error');
    }
  }
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| Z200 | Invalid credentials | Check your API keys |
| Z300 | Invalid symbol | Use supported cryptocurrency symbol |
| Z400 | Blockchain network error | Contact support |
| Z500 | No wallet configured | Contact support |
| Z600 | Invalid parameters | Review request structure |
| Z800 | Invalid body hash | Check hash generation |
| Z513/Z514 | Insufficient balance | Check account funds |

---

## TypeScript Support

The SDK is written in TypeScript and includes complete type definitions.

```typescript
import {
  Paybin,
  PaybinConfig,
  CryptoSymbol,
  NetworkId,
  DepositWebhookPayload,
  CreateDepositAddressResponse,
  WithdrawResponse,
  BalanceResponse
} from '@paybin/sdk';

// All types are exported and available
```

---

## Environment Variables

Create a `.env` file:

```env
PAYBIN_PUBLIC_KEY=your_public_key_here
PAYBIN_SECRET_KEY=your_secret_key_here
PAYBIN_ENVIRONMENT=sandbox
```

Usage:

```typescript
import { Paybin } from '@paybin/sdk';

const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY!,
  secretKey: process.env.PAYBIN_SECRET_KEY!,
  environment: process.env.PAYBIN_ENVIRONMENT as 'sandbox' | 'production'
});
```

---

## Testing

Always test with sandbox environment before going to production:

```typescript
// Sandbox (for testing)
const paybin = new Paybin({
  publicKey: 'sandbox_public_key',
  secretKey: 'sandbox_secret_key',
  environment: 'sandbox'
});

// Production
const paybin = new Paybin({
  publicKey: 'production_public_key',
  secretKey: 'production_secret_key',
  environment: 'production'
});
```

Sandbox URL: `https://sandbox.paybin.io`
Production URL: `https://gateway.paybin.io`

---

## Supported Cryptocurrencies

- **Bitcoin (BTC)** - Bitcoin Mainnet
- **Ethereum (ETH)** - Ethereum Mainnet, Optimism
- **Litecoin (LTC)** - Litecoin Mainnet
- **Binance Coin (BNB)** - Binance Smart Chain
- **Tether (USDT)** - Ethereum, BSC, Tron, Optimism
- **USD Coin (USDC)** - Ethereum, BSC
- **Tron (TRX)** - Tron Mainnet

---

## Security Best Practices

1. **Never expose your secret key** - Keep it in environment variables
2. **Use HTTPS** - Always use HTTPS for your webhook endpoints
3. **Verify webhooks** - Always verify webhook signatures
4. **Validate amounts** - Always verify transaction amounts match expected values
5. **Use unique reference IDs** - Prevent duplicate transactions
6. **Enable 2FA** - Use two-factor authentication for withdrawals
7. **Whitelist IPs** - Configure IP whitelist in Paybin dashboard
8. **Test thoroughly** - Use sandbox environment for testing
9. **Enable request signing** - Use RS512 signatures for production environments

---

## Request Signing Security

When request signing is enabled, the SDK signs every request body using RS512 (RSA with SHA-512) and includes the signature in the `X-Signature` header. This provides an additional layer of security to ensure request integrity and authenticity.

### Getting Your Private Key

You can obtain your private key from the [Paybin Portfolio](https://portfolio.paybin.io). Navigate to your API settings to download or copy your RSA private key.

### Configuration Options

The SDK supports three methods for providing the private key, with the following priority: `key` > `path` > `env`

#### Option 1: Environment Variable (Recommended for most deployments)

```typescript
// .env file
// PAYBIN_SIGNATURE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADA..."

const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY!,
  secretKey: process.env.PAYBIN_SECRET_KEY!,
  signature: { env: 'PAYBIN_SIGNATURE_PRIVATE_KEY' } // or omit 'env' to use default
});
```

#### Option 2: File Path (Recommended for Kubernetes/Docker)

```typescript
const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY!,
  secretKey: process.env.PAYBIN_SECRET_KEY!,
  signature: { path: '/etc/secrets/paybin/private-key.pem' }
});
```

#### Option 3: Direct Key (Use with caution)

```typescript
// Only use this when loading from a secure source
const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY!,
  secretKey: process.env.PAYBIN_SECRET_KEY!,
  signature: { key: privateKeyFromSecretManager }
});
```

### Secret Management Integration

For production environments, use a dedicated secret manager to store and retrieve your private key.

#### AWS Secrets Manager

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Paybin } from '@paybin/sdk';

async function createPaybinClient() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });

  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'paybin/signature-private-key' })
  );

  return new Paybin({
    publicKey: process.env.PAYBIN_PUBLIC_KEY!,
    secretKey: process.env.PAYBIN_SECRET_KEY!,
    signature: { key: response.SecretString }
  });
}
```

#### Google Cloud Secret Manager

```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Paybin } from '@paybin/sdk';

async function createPaybinClient() {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;

  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/paybin-signature-key/versions/latest`,
  });

  const privateKey = version.payload?.data?.toString();

  return new Paybin({
    publicKey: process.env.PAYBIN_PUBLIC_KEY!,
    secretKey: process.env.PAYBIN_SECRET_KEY!,
    signature: { key: privateKey }
  });
}
```

#### HashiCorp Vault

```typescript
import vault from 'node-vault';
import { Paybin } from '@paybin/sdk';

async function createPaybinClient() {
  const vaultClient = vault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR,
    token: process.env.VAULT_TOKEN
  });

  const result = await vaultClient.read('secret/data/paybin');
  const privateKey = result.data.data.signaturePrivateKey;

  return new Paybin({
    publicKey: process.env.PAYBIN_PUBLIC_KEY!,
    secretKey: process.env.PAYBIN_SECRET_KEY!,
    signature: { key: privateKey }
  });
}
```

#### Azure Key Vault

```typescript
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { Paybin } from '@paybin/sdk';

async function createPaybinClient() {
  const credential = new DefaultAzureCredential();
  const vaultUrl = `https://${process.env.AZURE_VAULT_NAME}.vault.azure.net`;
  const client = new SecretClient(vaultUrl, credential);

  const secret = await client.getSecret('paybin-signature-private-key');

  return new Paybin({
    publicKey: process.env.PAYBIN_PUBLIC_KEY!,
    secretKey: process.env.PAYBIN_SECRET_KEY!,
    signature: { key: secret.value }
  });
}
```

### Kubernetes Secret Mount

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
        - name: app
          volumeMounts:
            - name: paybin-secrets
              mountPath: /etc/secrets/paybin
              readOnly: true
      volumes:
        - name: paybin-secrets
          secret:
            secretName: paybin-signature-key
```

```typescript
// Application code
const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY!,
  secretKey: process.env.PAYBIN_SECRET_KEY!,
  signature: { path: '/etc/secrets/paybin/private-key.pem' }
});
```

### Security Checklist

- [ ] Use 4096-bit RSA keys for production
- [ ] Never commit private keys to version control
- [ ] Never hardcode private keys in source code
- [ ] Use environment variables or secret managers
- [ ] Rotate keys periodically
- [ ] Restrict file permissions: `chmod 600 private-key.pem`
- [ ] Use separate keys for sandbox and production
- [ ] Monitor for unauthorized key usage

---

## Support

- **Documentation**: [https://developers.paybin.io](https://developers.paybin.io)
- **Dashboard**: [https://portfolio.paybin.io](https://portfolio.paybin.io)
- **Email**: support@paybin.io

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.