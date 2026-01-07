# ChainAuth SDK API Reference

## Core Modules

### XRPLClient

XRPL client for connecting to the network.

```typescript
const client = new XRPLClient('wss://s.altnet.rippletest.net:51233');
await client.connect();
```

### DIDManager

Manage decentralized identifiers (DIDs) using XLS-40d.

```typescript
const didManager = new DIDManager();
const did = await didManager.createDID(accountAddress);
```

### WalletManager

Handle wallet creation and key management.

```typescript
const walletManager = new WalletManager();
const wallet = walletManager.generateWallet();
```

## Feature Modules

### RecoveryManager

Multi-signature account recovery using SignerListSet.

```typescript
const recoveryManager = new RecoveryManager();
await recoveryManager.setupRecovery(accountAddress, signers, quorum);
```

### CredentialManager

Issue and verify credentials using XLS-70d.

```typescript
const credentialManager = new CredentialManager();
const credential = await credentialManager.issueCredential(issuerDID, subjectDID, claims);
```

## Main SDK Class

```typescript
import { ChainAuthSDK } from '@chainauth/sdk';

const sdk = new ChainAuthSDK({
  xrplServerUrl: 'wss://s.altnet.rippletest.net:51233',
  network: 'testnet'
});

await sdk.connect();
// Use sdk.did, sdk.wallet, sdk.recovery, sdk.credentials
await sdk.disconnect();
```
