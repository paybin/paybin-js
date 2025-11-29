/**
 * Basic Usage Example
 *
 * This example demonstrates basic usage of the Paybin SDK
 */

import { Paybin, NetworkId } from '@paybin/sdk';

// Initialize the SDK
const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY || 'your_public_key',
  secretKey: process.env.PAYBIN_SECRET_KEY || 'your_secret_key',
  environment: 'sandbox'
});

async function main() {
  try {
    console.log('=== Paybin SDK Basic Usage Example ===\n');

    // 1. Create a deposit address
    console.log('1. Creating deposit address...');
    const deposit = await paybin.deposit.createAddress({
      symbol: 'ETH',
      label: 'User Payment',
      referenceId: `ORDER-${Date.now()}`,
      callbackUrl: 'https://yoursite.com/webhook',
      amount: 100,
      currency: 'USD'
    });

    console.log('✓ Deposit address created:');
    console.log('  Wallet:', deposit.data?.wallet);
    console.log('  Request ID:', deposit.data?.requestId);
    console.log('  Network:', deposit.data?.network);
    console.log('  Price:', deposit.data?.price);
    console.log();

    // 2. Get balances
    console.log('2. Getting account balances...');
    const balances = await paybin.balance.get();

    console.log('✓ Account Balances:');
    console.log('  BTC:', balances.data?.btcBalance);
    console.log('  ETH:', balances.data?.ethBalance);
    console.log('  USDT:', balances.data?.usdtBalance);
    console.log('  USDC (ETH):', balances.data?.ethusdcBalance);
    console.log();

    // 3. Get specific balance
    console.log('3. Getting ETH balance...');
    const ethBalance = await paybin.balance.getBySymbol('eth');
    console.log('✓ ETH Balance:', ethBalance);
    console.log();

    // 4. Get deposit address
    console.log('4. Retrieving existing deposit address...');
    const existingAddress = await paybin.deposit.getAddress({
      memberId: 'USER-12345',
      symbol: 'ETH'
    });

    console.log('✓ Retrieved address:');
    console.log('  Address:', existingAddress.data?.address);
    console.log('  Network:', existingAddress.data?.network);
    console.log();

    console.log('=== All operations completed successfully! ===');

  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.httpStatus) {
      console.error('HTTP Status:', error.httpStatus);
    }
  }
}

// Run the example
main();
