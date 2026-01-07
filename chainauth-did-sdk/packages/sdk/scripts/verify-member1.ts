
import { ChainAuthSDK } from '../src/index';

async function main() {
    console.log("Starting Member 1 Verification...");

    // 1. Connect to Testnet
    const sdk = new ChainAuthSDK({
        xrplServerUrl: 'wss://s.altnet.rippletest.net:51233',
        network: 'testnet'
    });
    await sdk.connect();
    console.log("Connected to XRPL Testnet");

    // 2. Generate Wallet
    const wallet = sdk.wallet.generateWallet();
    console.log(`Generated Wallet: ${wallet.address}`);

    // 3. Fund Wallet
    console.log("Funding wallet...");
    // Direct funding via client helper
    await sdk.getXRPLClient().getClient().fundWallet(wallet);
    console.log("Wallet funded");

    // 4. Register DID
    const didUri = "did:chainauth:data:123";
    console.log(`Registering DID with URI: ${didUri}`);
    const did = await sdk.did.registerDID(wallet, didUri);
    console.log(`DID Registered: ${did}`);

    // 5. Resolve DID
    console.log("Resolving DID...");
    const resolvedUri = await sdk.did.resolveDID(did);
    console.log(`Resolved URI: ${resolvedUri}`);

    if (resolvedUri === didUri) {
        console.log("SUCCESS: Resolved URI matches registered URI");
    } else {
        console.error(`FAILURE: Resolved URI '${resolvedUri}' does not match '${didUri}'`);
    }

    await sdk.disconnect();
}

main().catch(console.error);
