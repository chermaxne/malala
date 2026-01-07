import { ChainAuthSDK } from '../src/index';
import { Wallet, Client } from 'xrpl';

const getExplorerUrl = (txHash: string) => `https://testnet.xrpl.org/transactions/${txHash}`;

async function main() {
    console.log('--- ChainAuth SDK Demo ---');

    // 1. Initialize SDK on Testnet
    const sdk = new ChainAuthSDK({
        xrplServerUrl: 'wss://s.altnet.rippletest.net:51233',
        network: 'testnet'
    });
    await sdk.connect();
    console.log('✅ Connected to Testnet');

    try {
        // 2. Setup & Fund a wallet
        console.log('\nCreating and funding wallet...');
        const client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();
        const { wallet, balance } = await client.fundWallet();
        console.log(`✅ Wallet funded: ${wallet.address} (Balance: ${balance} XRP)`);
        console.log(`   Account Explorer: https://testnet.xrpl.org/accounts/${wallet.address}`);
        await client.disconnect();

        // 3. Test Recovery Setup
        console.log('\n--- Testing Recovery Feature ---');
        const signer1 = Wallet.generate();
        const signer2 = Wallet.generate();
        console.log(`Signers generated: \n  ${signer1.address}\n  ${signer2.address}`);

        // Enable Recovery (SignerListSet)
        console.log('Enabling recovery...');
        const recoveryHash = await sdk.recovery.enableRecovery(wallet, [signer1.address, signer2.address], 2);
        console.log(`✅ Recovery Enabled!`);
        console.log(`   TxHash: ${recoveryHash}`);
        console.log(`   Explorer: ${getExplorerUrl(recoveryHash)}`);

        // Wait for ledger closing/indexing to prevent sequence errors
        console.log('Waiting 5s for ledger propagation...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 4. Test Credential Issuance
        console.log('\n--- Testing Credential Feature ---');
        const cred = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            id: `did:chainauth:${Date.now()}`,
            type: ['VerifiableCredential'],
            issuer: `did:chainauth:${wallet.address}`,
            issuanceDate: new Date().toISOString(),
            credentialSubject: { id: 'did:chainauth:recipient' },
            proof: {}
        };

        console.log('Issuing credential...');
        const issueResult = await sdk.credentials.issueCredential(wallet, cred);
        console.log(`✅ Credential Anchored!`);
        console.log(`   Hash: ${issueResult.hash}`);
        console.log(`   TxHash: ${issueResult.txHash}`);
        console.log(`   Explorer: ${getExplorerUrl(issueResult.txHash)}`);

        // Verify
        console.log('Verifying credential...');
        const isValid = await sdk.credentials.verifyCredential(cred, issueResult.txHash);
        console.log(`✅ Credential Verification: ${isValid}`);

        // 5. Test Payment (RLUSD Simulation)
        console.log('\n--- Testing Payment Feature ---');
        const dest = Wallet.generate();

        try {
            console.log('Attempting to send simulated RLUSD...');
            const paymentHash = await sdk.payments.sendRLUSD(
                wallet,
                '100',
                dest.address,
                wallet.address, // Self-issuing for test
                'RLUSD'
            );
            console.log(`✅ Payment Sent!`);
            console.log(`   TxHash: ${paymentHash}`);
            console.log(`   Explorer: ${getExplorerUrl(paymentHash)}`);
        } catch (e: any) {
            console.log(`⚠️  Payment test expectedly failed (need TrustSet): ${e.message}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sdk.disconnect();
        console.log('\n--- Demo Complete ---');
    }
}

main();
