# Paybin SDK Development Guide

This document provides information for developers who want to contribute to or understand the structure of the Paybin SDK.

## Project Structure

```
@paybin/sdk/
├── src/
│   ├── api/               # API endpoint implementations
│   │   ├── balance.ts     # Balance API methods
│   │   ├── deposit.ts     # Deposit API methods
│   │   └── withdraw.ts    # Withdraw API methods
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All types, interfaces, enums
│   ├── utils/             # Utility functions
│   │   ├── hash.ts        # Hash generation utilities
│   │   └── webhook.ts     # Webhook verification utilities
│   ├── client.ts          # Base HTTP client with interceptors
│   ├── paybin.ts          # Main SDK class
│   └── index.ts           # Entry point with exports
├── examples/              # Usage examples
│   ├── basic-usage.ts
│   ├── withdrawal-flow.ts
│   ├── express-webhook.ts
│   ├── nextjs-api-route.ts
│   ├── error-handling.ts
│   └── README.md
├── dist/                  # Built files (generated)
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── .gitignore
```

## Architecture Overview

### 1. Core Components

#### PaybinClient (`src/client.ts`)
- Base HTTP client using Axios
- Handles authentication (X-Api-Key header)
- Error handling with interceptors
- Base URL configuration (sandbox/production)

#### Paybin (`src/paybin.ts`)
- Main SDK class
- Exposes API modules: `deposit`, `withdraw`, `balance`
- Constructor accepts configuration

#### API Modules
- **DepositAPI**: Create and retrieve deposit addresses
- **WithdrawAPI**: Manage withdrawals and address verification
- **BalanceAPI**: Query account balances

### 2. Type System

All types are defined in `src/types/index.ts`:
- Request/Response interfaces
- Configuration types
- Error types and enums
- Webhook payload types

### 3. Utilities

#### Hash Generation (`src/utils/hash.ts`)
- MD5 hash generation for API requests
- HMAC-SHA256 for webhook verification
- Separate functions for each endpoint type

#### Webhook Handling (`src/utils/webhook.ts`)
- Signature verification
- Payload parsing
- Express middleware factory

## Building the SDK

### Install Dependencies

```bash
npm install
```

### Development Build

```bash
npm run dev
```

This watches for changes and rebuilds automatically.

### Production Build

```bash
npm run build
```

Generates:
- `dist/index.js` - CommonJS bundle
- `dist/index.mjs` - ESM bundle
- `dist/index.d.ts` - TypeScript declarations

## Testing

### Manual Testing

Use the examples in the `examples/` directory:

```bash
# Set environment variables
export PAYBIN_PUBLIC_KEY="your_key"
export PAYBIN_SECRET_KEY="your_secret"

# Run examples with ts-node
npx ts-node examples/basic-usage.ts
```

### Testing with a Real Project

Link the SDK locally:

```bash
# In SDK directory
npm link

# In your test project
npm link @paybin/sdk
```

## API Integration Checklist

When adding a new API endpoint:

1. **Define Types** (`src/types/index.ts`)
   - Request interface
   - Response interface
   - Any specific enums or types

2. **Add Hash Generation** (if needed, `src/utils/hash.ts`)
   - Create hash generation function
   - Follow Paybin's hash formula

3. **Implement API Method** (`src/api/*.ts`)
   - Create method in appropriate API class
   - Add JSDoc comments with examples
   - Handle request/response mapping

4. **Export** (`src/index.ts`)
   - Export new types
   - Ensure API class is accessible

5. **Document** (`README.md`)
   - Add usage example
   - Document parameters and responses

6. **Create Example** (`examples/`)
   - Create standalone example file
   - Add to examples README

## Code Style

### TypeScript Guidelines

- Use strict mode
- Prefer interfaces over types for objects
- Export all public types
- Use meaningful variable names
- Add JSDoc comments to public methods

### Example Method Documentation

```typescript
/**
 * Creates a new deposit address for receiving cryptocurrency
 * @param params - Deposit address creation parameters
 * @returns Promise with wallet address and request details
 *
 * @example
 * ```typescript
 * const deposit = await paybin.deposit.createAddress({
 *   symbol: 'ETH',
 *   label: 'User Payment',
 *   referenceId: 'ORDER-12345',
 *   callbackUrl: 'https://yoursite.com/webhook'
 * });
 * ```
 */
async createAddress(params: CreateAddressParams): Promise<Response> {
  // Implementation
}
```

## Publishing to NPM

### Pre-publish Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Run `npm run build` to ensure clean build
4. Test with `npm pack` to verify package contents
5. Verify all files are included (check `.npmignore`)

### Publish Commands

```bash
# Dry run to see what would be published
npm publish --dry-run

# Publish to npm
npm publish --access public
```

For scoped packages (`@paybin/sdk`), you need `--access public` on first publish.

## Error Handling Pattern

All API methods should allow `PaybinError` to propagate:

```typescript
try {
  const response = await this.client.post<ResponseType>(endpoint, data);
  return response;
} catch (error) {
  // PaybinClient already throws PaybinError
  // Just let it propagate
  throw error;
}
```

The client handles error transformation in interceptors.

## Adding New Features

### Example: Adding a New API Endpoint

1. **Check API Documentation**
   - URL and HTTP method
   - Required/optional parameters
   - Response format
   - Hash requirements

2. **Create Types**
```typescript
// src/types/index.ts
export interface NewFeatureRequest {
  PublicKey: string;
  // ... other params
}

export interface NewFeatureResponse {
  // ... response fields
}
```

3. **Add Hash Function** (if needed)
```typescript
// src/utils/hash.ts
export function generateNewFeatureHash(
  input: NewFeatureHashInput,
  secretKey: string
): string {
  const hashString = input.param1 + input.param2 + secretKey;
  return CryptoJS.MD5(hashString).toString();
}
```

4. **Implement API Method**
```typescript
// src/api/newfeature.ts or add to existing file
async newFeature(params: NewFeatureParams): Promise<Response> {
  const hash = generateNewFeatureHash({...}, this.client.getSecretKey());

  const request: NewFeatureRequest = {
    PublicKey: this.client.getPublicKey(),
    ...params,
    Hash: hash
  };

  return this.client.post<NewFeatureResponse>('/v1/path', request);
}
```

5. **Update Main Class**
```typescript
// src/paybin.ts
export class Paybin {
  public newFeature: NewFeatureAPI;

  constructor(config: PaybinConfig) {
    // ...
    this.newFeature = new NewFeatureAPI(this.client);
  }
}
```

6. **Export**
```typescript
// src/index.ts
export { NewFeatureAPI } from './api/newfeature';
```

## Debugging

### Enable Debug Logging

Add axios debug interceptor in `client.ts`:

```typescript
this.axiosInstance.interceptors.request.use(req => {
  console.log('Request:', req.method?.toUpperCase(), req.url);
  console.log('Data:', req.data);
  return req;
});
```

### Test with Local Server

```typescript
// Override base URL for local testing
const paybin = new Paybin({
  publicKey: 'test',
  secretKey: 'test',
  environment: 'sandbox'
});

// Access internal client for advanced testing
(paybin as any).client.axiosInstance.defaults.baseURL = 'http://localhost:3000';
```

## Security Considerations

1. **Never log secret keys**
2. **Always use HTTPS in production**
3. **Validate webhook signatures**
4. **Use environment variables for credentials**
5. **Don't commit `.env` files**
6. **Sanitize error messages before showing to users**

## Support

For questions or issues:
- GitHub Issues: [Create an issue](https://github.com/yourusername/paybin-sdk/issues)
- Documentation: https://developers.paybin.io
- Email: support@paybin.io

## License

MIT License - see [LICENSE](LICENSE) file
