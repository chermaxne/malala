
import { ChainAuthSDK } from '../src/index';
import { Wallet, Client } from 'xrpl';

const getExplorerUrl = (txHash: string) => `https://testnet.xrpl.org/transactions/${txHash}`;

async function main() {
    console.log('--- Member 2 Verification: Recovery & Credentials ---');

    // 1. Initialize SDK
    const sdk = new ChainAuthSDK({
        xrplServerUrl: 'wss://s.altnet.rippletest.net:51233',
        network: 'testnet'
    });
    await sdk.connect();
    console.log('✅ SDK Connected');

    // 2. Setup Wallets (User + 2 Guardians)
    console.log('\n--- Setup ---');
    const userWallet = sdk.wallet.generateWallet();
    const guardianQr1 = Wallet.generate();
    const guardianQr2 = Wallet.generate();

    console.log(`User Wallet:     ${userWallet.address}`);
    console.log(`User Seed:       ${userWallet.seed}`);
    console.log(`Guardian 1:      ${guardianQr1.address}`);
    console.log(`Guardian 2:      ${guardianQr2.address}`);

    // Fund User Wallet
    console.log('Funding User Wallet...');
    await sdk.getXRPLClient().getClient().fundWallet(userWallet);
    console.log('✅ User Wallet funded');

    // 3. Setup Monitoring
    console.log('\n--- Monitoring Setup ---');
    console.log(`Listening for transactions on ${userWallet.address}...`);
    await sdk.getXRPLClient().subscribeToAccount(userWallet.address, (tx) => {
        if (tx.transaction && tx.transaction.TransactionType) {
            console.log(`\n🔔 ALERT: Transaction detected! Type: ${tx.transaction.TransactionType}`);
            console.log(`   Hash: ${tx.transaction.hash}`);
        }
    });

    // 4. Test Recovery (SignerListSet)
    console.log('\n--- Testing Recovery (SignerListSet) ---');
    try {
        const recoveryHash = await sdk.recovery.enableRecovery(
            userWallet,
            [guardianQr1.address, guardianQr2.address],
            2
        );
        console.log(`✅ Recovery Enabled`);
        console.log(`   TxHash: ${recoveryHash}`);
        console.log(`   Link: ${getExplorerUrl(recoveryHash)}`);
    } catch (e: any) {
        console.error(`❌ Recovery Failed: ${e.message}`);
    }

    // 5. Test Credentials (XLS-70d Anchoring)
    console.log('\n--- Testing Credential Issuance ---');
    // For this test, the User issues a credential to themselves (Self-Sovereign Identity style)
    // or acts as an issuer for demo purposes.
    const cred = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: `did:chainauth:${Date.now()}`,
        type: ['VerifiableCredential', 'VerifiedHuman'],
        issuer: `did:chainauth:${userWallet.address}`,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
            id: `did:chainauth:user:${userWallet.address}`,
            verificationStatus: 'verified'
        },
        proof: {}
    };

    try {
        const issueResult = await sdk.credentials.issueCredential(userWallet, cred);
        console.log(`✅ Credential Issued & Anchored`);
        console.log(`   Anchor Hash: ${issueResult.hash}`);
        console.log(`   TxHash:      ${issueResult.txHash}`);
        console.log(`   Link:        ${getExplorerUrl(issueResult.txHash)}`);

        // Brief pause to allow listener to print (event loop)
        await new Promise(r => setTimeout(r, 2000));

    } catch (e: any) {
        console.error(`❌ Credential Failed: ${e.message}`);
    }

    // Wrap up
    await sdk.disconnect();
    console.log('\n--- Verification Complete ---');
    process.exit(0);
}

main().catch(console.error);
