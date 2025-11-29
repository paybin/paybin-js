/**
 * Withdrawal Flow Example
 *
 * This example demonstrates the complete withdrawal process:
 * 1. Verify withdrawal address
 * 2. Confirm verification amount
 * 3. Make withdrawal
 */

import { Paybin, NetworkId } from '@paybin/sdk';
import * as readline from 'readline';

const paybin = new Paybin({
  publicKey: process.env.PAYBIN_PUBLIC_KEY || 'your_public_key',
  secretKey: process.env.PAYBIN_SECRET_KEY || 'your_secret_key',
  environment: 'sandbox'
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('=== Paybin Withdrawal Flow Example ===\n');

    // Get user input
    const userReferenceId = await prompt('Enter user reference ID (e.g., USER-12345): ');
    const withdrawalAddress = await prompt('Enter withdrawal address: ');
    const symbol = await prompt('Enter cryptocurrency symbol (BTC/ETH/USDT): ') as any;
    const networkIdInput = await prompt('Enter network ID (1=BTC, 2=LTC, 3=ETH, 4=BSC, 5=OPT, 6=TRX): ');
    const networkId = parseInt(networkIdInput) as NetworkId;

    console.log('\n--- Step 1: Start Address Verification ---');
    console.log('Paybin will send a small amount to verify wallet ownership...\n');

    const verification = await paybin.withdraw.verifyStart({
      referenceId: userReferenceId,
      symbol: symbol,
      networkId: networkId,
      address: withdrawalAddress,
      label: 'My Withdrawal Wallet'
    });

    console.log('✓ Verification transaction sent!');
    console.log('  Transaction ID:', verification.data?.txId);
    console.log('  Amount sent:', verification.data?.amount, symbol);
    console.log();

    console.log('Please check your wallet and note the EXACT amount received.');
    const receivedAmount = await prompt('Enter the exact amount you received: ');

    console.log('\n--- Step 2: Confirm Verification Amount ---');

    const confirmResult = await paybin.withdraw.verifyConfirmAmount({
      referenceId: userReferenceId,
      symbol: symbol,
      networkId: networkId,
      amount: parseFloat(receivedAmount)
    });

    if (confirmResult.data?.isVerified) {
      console.log('✓ Address verified successfully!\n');
    } else {
      console.log('✗ Verification failed. Please try again with correct amount.\n');
      rl.close();
      return;
    }

    // Check verified addresses
    console.log('--- Step 3: Get Verified Addresses ---');
    const assets = await paybin.withdraw.getWithdrawableAssets(userReferenceId);

    console.log('✓ Verified withdrawal addresses:');
    assets.data?.forEach((asset: any) => {
      console.log(`  ${asset.symbol} (Network ${asset.networkId}): ${asset.address}`);
    });
    console.log();

    // Make withdrawal
    console.log('--- Step 4: Initiate Withdrawal ---');
    const withdrawAmount = await prompt('Enter withdrawal amount: ');
    const tfaCode = await prompt('Enter 2FA code: ');
    const email = await prompt('Enter your email: ');

    const withdrawal = await paybin.withdraw.add({
      referenceId: userReferenceId,
      amount: parseFloat(withdrawAmount),
      symbol: symbol,
      networkId: networkId,
      address: withdrawalAddress,
      label: 'Withdrawal',
      merchantTransactionId: `WITHDRAW-${Date.now()}`,
      tfaCode: tfaCode,
      email: email
    });

    console.log('\n✓ Withdrawal successful!');
    console.log('  Transaction ID:', withdrawal.data?.txId);
    console.log('  Explorer URL:', withdrawal.data?.explorerUrl);
    console.log();

    console.log('=== Withdrawal process completed! ===');

  } catch (error: any) {
    console.error('\n✗ Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  } finally {
    rl.close();
  }
}

// Run the example
main();
