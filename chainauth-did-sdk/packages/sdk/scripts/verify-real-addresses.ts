#!/usr/bin/env ts-node
/**
 * Verification Script - Test Real XRPL Addresses vs Mock
 * 
 * This script shows you how to:
 * 1. Create a REAL address on XRPL testnet
 * 2. Verify it exists on the blockchain
 * 3. Check DID registration
 * 4. Compare with mock addresses
 */

import { ChainAuthSDK } from '../src/index';
import { Client } from 'xrpl';

// ANSI colors for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

async function verifyAddress(address: string, client: Client): Promise<void> {
  console.log(`\n${colors.blue}━━━ Checking Address: ${address} ━━━${colors.reset}`);
  
  try {
    // 1. Check if account exists on blockchain
    const accountInfo = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });

    console.log(`${colors.green}✅ REAL ADDRESS - Exists on XRPL Testnet${colors.reset}`);
    console.log(`   Balance: ${accountInfo.result.account_data.Balance} drops`);
    console.log(`   Sequence: ${accountInfo.result.account_data.Sequence}`);
    console.log(`   🔗 Explorer: https://testnet.xrpl.org/accounts/${address}`);

    // 2. Check if DID is registered
    const didObjects = await client.request({
      command: 'account_objects',
      account: address,
      type: 'did'
    });

    if (didObjects.result.account_objects.length > 0) {
      const didData = didObjects.result.account_objects[0] as any;
      console.log(`${colors.green}✅ DID REGISTERED${colors.reset}`);
      console.log(`   DID: did:xrpl:1:${address}`);
      if (didData.URI) {
        const uriHex = didData.URI;
        // Convert hex to string
        const uri = Buffer.from(uriHex, 'hex').toString('utf-8');
        console.log(`   DID Document URI: ${uri}`);
      }
    } else {
      console.log(`${colors.yellow}⚠️  No DID registered yet${colors.reset}`);
    }

  } catch (error: any) {
    if (error.data?.error === 'actNotFound') {
      console.log(`${colors.red}❌ MOCK/FAKE ADDRESS - Does not exist on XRPL${colors.reset}`);
      console.log(`   This address was never funded or created on the blockchain`);
    } else {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
  }
}

async function main() {
  console.log(`${colors.blue}
╔════════════════════════════════════════════════════════════╗
║  ChainAuth Address Verification Tool                      ║
║  Testing Real vs Mock XRPL Addresses                      ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // Connect to XRPL Testnet
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  console.log(`${colors.green}✅ Connected to XRPL Testnet${colors.reset}\n`);

  // 1. Test a MOCK address (from your demo)
  console.log(`${colors.yellow}═══ Test 1: Mock Address (From Demo Config) ═══${colors.reset}`);
  const mockAddress = 'rN7n7otQDd6FczFgLdlqtyMVrn3LNU8AqA';
  await verifyAddress(mockAddress, client);

  // 2. Create a REAL address on testnet
  console.log(`\n${colors.yellow}═══ Test 2: Creating REAL Address on Testnet ═══${colors.reset}`);
  console.log('Requesting funds from testnet faucet...');
  
  const fundResult = await client.fundWallet();
  const realWallet = fundResult.wallet;
  
  console.log(`${colors.green}✅ Real wallet created!${colors.reset}`);
  console.log(`   Address: ${realWallet.address}`);
  console.log(`   Public Key: ${realWallet.publicKey}`);
  console.log(`   Balance: ${fundResult.balance} XRP`);
  
  await verifyAddress(realWallet.address, client);

  // 3. Register a DID for the real address
  console.log(`\n${colors.yellow}═══ Test 3: Registering DID for Real Address ═══${colors.reset}`);
  
  const sdk = new ChainAuthSDK({
    xrplServerUrl: 'wss://s.altnet.rippletest.net:51233',
    network: 'testnet'
  });
  await sdk.connect();

  const didDocumentUri = `https://chainauth.example.com/did/${realWallet.address}`;
  const didResult = await sdk.did.registerDID(realWallet, didDocumentUri);
  
  console.log(`${colors.green}✅ DID Registered on Blockchain!${colors.reset}`);
  console.log(`   DID: ${didResult.did}`);
  console.log(`   Transaction Hash: ${didResult.txHash}`);
  console.log(`   🔗 View Transaction: https://testnet.xrpl.org/transactions/${didResult.txHash}`);

  // Wait for ledger to close
  console.log('\nWaiting 5 seconds for ledger to close...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 4. Verify the DID now shows up
  console.log(`\n${colors.yellow}═══ Test 4: Re-verify Address (Should Show DID Now) ═══${colors.reset}`);
  await verifyAddress(realWallet.address, client);

  // 5. Use the SDK's verifyDID method
  console.log(`\n${colors.yellow}═══ Test 5: Using SDK's verifyDID Method ═══${colors.reset}`);
  const verification = await sdk.did.verifyDID(didResult.did);
  
  console.log(`\nVerification Result:`);
  console.log(`   Exists: ${verification.exists ? colors.green + '✅ YES' : colors.red + '❌ NO'}${colors.reset}`);
  console.log(`   Address: ${verification.address}`);
  console.log(`   URI: ${verification.uri}`);
  console.log(`   Message: ${verification.message}`);

  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}
✅ VERIFICATION COMPLETE!

Key Takeaways:
1. Mock addresses DO NOT exist on blockchain (will fail verification)
2. Real addresses ARE funded and exist on testnet
3. DIDs are registered as DIDSet transactions on XRPL
4. You can verify everything on: https://testnet.xrpl.org

Your Real Testnet Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Address:    ${realWallet.address}
DID:        ${didResult.did}
Public Key: ${realWallet.publicKey}
Explorer:   https://testnet.xrpl.org/accounts/${realWallet.address}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Save these credentials to use in your demo app!
${colors.reset}`);

  await sdk.disconnect();
  await client.disconnect();
}

main().catch(console.error);
