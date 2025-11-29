/**
 * Error Handling Example
 *
 * This example demonstrates how to handle different types of errors
 */

import { Paybin, PaybinError, PaybinErrorCode, NetworkId } from '@paybin/sdk';

const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY || 'your_public_key',
  secretKey: process.env.PAYBIN_SECRET_KEY || 'your_secret_key',
  environment: 'sandbox'
});

async function exampleWithErrorHandling() {
  try {
    console.log('Attempting to create deposit address...\n');

    const deposit = await paybin.deposit.createAddress({
      symbol: 'ETH',
      label: 'Test Payment',
      referenceId: `REF-${Date.now()}`,
      callbackUrl: 'https://yoursite.com/webhook'
    });

    console.log('Success! Deposit address:', deposit.data?.wallet);

  } catch (error) {
    if (error instanceof PaybinError) {
      console.error('=== Paybin API Error ===');
      console.error('Message:', error.message);
      console.error('Error Code:', error.code);
      console.error('HTTP Status:', error.httpStatus);

      // Handle specific error codes
      switch (error.code) {
        case PaybinErrorCode.Z200:
          console.error('\n→ Invalid credentials detected');
          console.error('Solution: Check your API keys in .env file');
          break;

        case PaybinErrorCode.Z300:
          console.error('\n→ Invalid cryptocurrency symbol');
          console.error('Solution: Use supported symbols (BTC, ETH, LTC, USDT, USDC, BNB, TRX)');
          break;

        case PaybinErrorCode.Z400:
          console.error('\n→ Blockchain network error');
          console.error('Solution: Contact Paybin support');
          break;

        case PaybinErrorCode.Z500:
          console.error('\n→ No wallet configured');
          console.error('Solution: Contact Paybin support to configure wallet');
          break;

        case PaybinErrorCode.Z600:
          console.error('\n→ Invalid parameters');
          console.error('Solution: Review your request parameters');
          break;

        case PaybinErrorCode.Z800:
          console.error('\n→ Invalid body hash');
          console.error('Solution: Check hash generation or secret key');
          break;

        default:
          console.error('\n→ Unknown error code:', error.code);
      }

      // Access full response if available
      if (error.response) {
        console.error('\nFull API Response:');
        console.error(JSON.stringify(error.response, null, 2));
      }

    } else {
      // Handle non-Paybin errors
      console.error('Unexpected error:', error);
    }
  }
}

async function exampleWithdrawalErrors() {
  try {
    console.log('Attempting withdrawal...\n');

    const withdrawal = await paybin.withdraw.add({
      referenceId: 'USER-12345',
      amount: 0.1,
      symbol: 'ETH',
      networkId: NetworkId.EthereumMainnet,
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      label: 'Test Withdrawal',
      merchantTransactionId: `WITHDRAW-${Date.now()}`,
      tfaCode: '123456',
      email: 'user@example.com'
    });

    console.log('Success! Transaction:', withdrawal.data?.txId);

  } catch (error) {
    if (error instanceof PaybinError) {
      console.error('=== Withdrawal Error ===');

      switch (error.code) {
        case PaybinErrorCode.Z202:
          console.error('Invalid 2FA code');
          console.error('Solution: Check your authenticator app and try again');
          break;

        case PaybinErrorCode.Z501:
        case PaybinErrorCode.Z502:
        case PaybinErrorCode.Z503:
        case PaybinErrorCode.Z504:
        case PaybinErrorCode.Z519:
          console.error('Duplicate transaction detected');
          console.error('Solution: Use a unique merchantTransactionId');
          break;

        case PaybinErrorCode.Z507:
          console.error('Withdrawal amount too small');
          console.error('Solution: Increase withdrawal amount');
          break;

        case PaybinErrorCode.Z509:
          console.error('Awaiting email approval');
          console.error('Solution: Check your email and approve the withdrawal');
          break;

        case PaybinErrorCode.Z511:
          console.error('Invalid withdrawal address');
          console.error('Solution: Verify the address format and network');
          break;

        case PaybinErrorCode.Z513:
        case PaybinErrorCode.Z514:
          console.error('Insufficient balance');
          console.error('Solution: Check your account balance');
          break;

        case PaybinErrorCode.Z529:
          console.error('SMS verification needed');
          console.error('Solution: Check your phone for SMS code');
          break;

        case PaybinErrorCode.Z531:
          console.error('Invalid SMS code');
          console.error('Solution: Enter the correct SMS verification code');
          break;

        case PaybinErrorCode.Z533:
          console.error('IP not whitelisted');
          console.error('Solution: Add your IP to whitelist in Paybin dashboard');
          break;

        case PaybinErrorCode.Z540:
          console.error('Address limit reached');
          console.error('Solution: Remove inactive addresses from your account');
          break;

        default:
          console.error('Withdrawal error:', error.message);
      }
    }
  }
}

async function exampleRetryLogic() {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`Attempt ${retries + 1}/${maxRetries}...\n`);

      const balances = await paybin.balance.get();
      console.log('Success! ETH Balance:', balances.data?.ethBalance);
      break; // Success, exit loop

    } catch (error) {
      retries++;

      if (error instanceof PaybinError) {
        // Don't retry on certain errors
        const noRetryErrors = [
          PaybinErrorCode.Z200, // Invalid credentials
          PaybinErrorCode.Z300, // Invalid symbol
          PaybinErrorCode.Z600, // Invalid parameters
          PaybinErrorCode.Z800, // Invalid hash
        ];

        if (noRetryErrors.includes(error.code as PaybinErrorCode)) {
          console.error('Non-retryable error:', error.message);
          break; // Don't retry
        }
      }

      if (retries < maxRetries) {
        const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('Max retries reached');
        throw error;
      }
    }
  }
}

// Run examples
async function main() {
  console.log('=== Error Handling Examples ===\n');

  console.log('1. Basic error handling:');
  await exampleWithErrorHandling();

  console.log('\n---\n');

  console.log('2. Withdrawal errors:');
  await exampleWithdrawalErrors();

  console.log('\n---\n');

  console.log('3. Retry logic with exponential backoff:');
  await exampleRetryLogic();
}

main().catch(console.error);
