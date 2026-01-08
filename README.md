# ChainAuth SDK - Decentralized Identity on XRP Ledger

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![XRPL](https://img.shields.io/badge/XRPL-Testnet-blue)](https://xrpl.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![Tests Passing](https://img.shields.io/badge/tests-6%2F6%20passing-brightgreen)](./packages/sdk/tests)

**NUS Fintech Hackathon 2026** | A comprehensive DID authentication SDK built on XRP Ledger

ChainAuth is a production-ready TypeScript SDK that enables developers to integrate decentralized identity, verifiable credentials, and social recovery into any application using the XRP Ledger blockchain.

---

## Problem Solved

Every dApp rebuilds authentication from scratch. Users manage dozens of private keys. No standardized way to prove identity across platforms without centralized providers like Google/Facebook.

**ChainAuth provides**: A drop-in SDK for XRPL-based authentication with social recovery, multi-device support, and verifiable credentials - integration in under 30 minutes.

---

## Project Structure

```
chainauth-did-sdk/
├── apps/
│   └── demo-app/          # Frontend demo application
├── packages/
│   └── sdk/               # Core SDK package
│       ├── src/
│       │   ├── core/      # Client, DID, Wallet
│       │   ├── features/  # Recovery, Credentials, Payments
│       │   └── utils/     # Errors, Validation
│       ├── tests/         # Unit tests (6/6 passing)
│       └── scripts/       # Demo verification script
├── docs/                  # Documentation
└── turbo.json            # Build pipeline
```

---

## Quick Start

```bash
# Install
npm install @chainauth/sdk

# Use
import { ChainAuthSDK } from '@chainauth/sdk';

const sdk = new ChainAuthSDK({
  xrplServerUrl: 'wss://s.altnet.rippletest.net:51233',
  network: 'testnet'
});

await sdk.connect();

// Register DID
const did = await sdk.did.registerDID(wallet, 'https://example.com/did/doc');

// Issue verifiable credential
const credential = await sdk.credentials.issueCredential(wallet, credentialData);

// Send RLUSD payment
await sdk.payments.sendRLUSD(wallet, '100', recipientAddress, issuerAddress);
```

---

## XRPL Features Used

### 1. SignerListSet (Multi-Signature Social Recovery)

**XRPL Transaction Type:** `SignerListSet`  
**Use Case:** Guardian-based account recovery

```typescript
// Enable recovery with 2 guardians, requiring both signatures
await sdk.recovery.enableRecovery(wallet, [guardian1, guardian2], 2);
```

**Real-World Example:**

Chermaine creates an account and wants protection against losing her private key:

1. **Setup Phase** - Chermaine adds trusted guardians
```typescript
// Chermaine's wallet
const chermaine = Wallet.fromSeed('sEd...');

// Guardian wallets (Alice and Bob)
const alice = 'rAliceGuardian1...';
const bob = 'rBobGuardian2...';

// Enable recovery - requires BOTH guardians to sign
await sdk.recovery.enableRecovery(chermaine, [alice, bob], 2);
// On-chain: Sets SignerListSet with quorum=2
```

2. **Loss Event** - Chermaine loses her private key

3. **Recovery Flow** - Guardians help Chermaine recover
```typescript
// Step 1: Chermaine initiates recovery with new key
const newKey = Wallet.generate(); // Chermaine's new wallet
const recoveryTx = await sdk.recovery.initiateRecovery(
  chermaine.address,      // Account to recover
  newKey.address          // New key to control account (using address, not publicKey)
);

// Step 2: Alice signs the recovery transaction
const aliceWallet = Wallet.fromSeed('sEd_alice...');
const aliceSig = await sdk.recovery.signForRecovery(recoveryTx, aliceWallet);
// Returns: { tx_blob: '...', id: '...' }

// Step 3: Bob signs the recovery transaction  
const bobWallet = Wallet.fromSeed('sEd_bob...');
const bobSig = await sdk.recovery.signForRecovery(recoveryTx, bobWallet);
// Returns: { tx_blob: '...', id: '...' }

// Step 4: Combine signatures and submit (quorum met: 2/2)
const txHash = await sdk.recovery.combineSignatures([
  aliceSig.tx_blob,  // Use tx_blob from each signature
  bobSig.tx_blob
]);
// Chermaine can now use newKey to control her account!
```

**On-Chain Proof:**
- Sets up multi-signature configuration directly on XRPL
- Guardians can sign recovery transactions to regain account access
- [View Transaction Example](https://testnet.xrpl.org/transactions/5BEF088A1D8B8CE39E294248AB1FDF95120F434D3D5FB1CB825044E6BBC1E361)

**XRPL Benefits:**
- Native multi-sig support (no smart contracts needed)
- Secure and battle-tested
- Low transaction fees (~0.00001 XRP)
- **Account ownership preserved** - only the key changes, account history remains

---

### 2. Payment with Memos (Verifiable Credentials)

**XRPL Transaction Type:** `Payment` with `Memo` field  
**Use Case:** On-chain credential hash anchoring

```typescript
// Issue credential - anchors hash on XRPL
const result = await sdk.credentials.issueCredential(wallet, {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiableCredential'],
  issuer: `did:chainauth:${wallet.address}`,
  credentialSubject: { verified: true }
});
// Returns: { hash: '9449896A...', txHash: '61681BD4...' }
```

**How It Works:**
1. SDK creates SHA-256 hash of credential JSON
2. Sends 1-drop payment to self with hash in `MemoData` field
3. `MemoType` set to `ChainAuth:Credential` for identification

**On-Chain Proof:**
- [View Credential Transaction](https://testnet.xrpl.org/transactions/61681BD4A84BFEF2334EC416899D8A47CDA33172E2821DE4E4952F0977FC11BF)
- Check Memos section for credential hash
- Immutable proof of credential issuance time

**XRPL Benefits:**
- Permanent, tamper-proof storage
- Timestamp verification
- Low cost (0.000001 XRP per credential)

---

### 3. DIDSet (XLS-40d DID Registration)

**XRPL Transaction Type:** `DIDSet`  
**Use Case:** W3C-compliant decentralized identifiers

```typescript
const didUri = 'https://chainauth.example.com/did/rAddress...';
const did = await sdk.did.registerDID(wallet, didUri);
// Returns: "did:xrpl:1:rN7n7otQDd6FczFgLdlqtyMVrn3LNU8AqA"
```

**On-Chain Proof:**
- DID document URI stored in `URI` field (hex-encoded)
- Resolvable via `account_objects` RPC call
- [View Transaction Example](https://testnet.xrpl.org/transactions/DB7F087D64BAD71EEC1DADF2671E126931F1361381AE7AFAED6D603605B5947E)

**XRPL Benefits:**
- Standards-compliant (XLS-40d)
- Native DID support on XRPL
- Interoperable with W3C DID ecosystem

---

### 4. RLUSD Payments (Issued Currency)

**XRPL Transaction Type:** `Payment` with issued currency  
**Use Case:** Stablecoin aid distribution

```typescript
await sdk.payments.sendRLUSD(
  senderWallet,
  '100',           // Amount
  recipientAddress,
  issuerAddress,
  'RLUSD'         // Currency code
);
```

**XRPL Benefits:**
- Native support for issued currencies
- Atomic settlement
- Built-in TrustLine protection

---

### 5. Transaction Monitoring (WebSocket / RPC)

**XRPL API:** `tx` command  
**Use Case:** Real-time transaction status tracking

```typescript
const status = await sdk.recovery.monitorTransaction(txHash);
// Returns: { validated: true, status: 'tesSUCCESS', ledgerIndex: 13846749 }
```

**Features:**
- Check validation status
- Get transaction result codes
- Verify ledger inclusion

---

## SDK Architecture

```
@chainauth/sdk
├─ RecoveryManager      (SignerListSet)
├─ CredentialManager    (Payment + Memos)
├─ DIDManager          (DIDSet - XLS-40d)
├─ PaymentManager      (RLUSD Issued Currency)
└─ WalletManager       (Key management)
```

Each manager is independently usable or combine them for full auth flow.

---

## Testing & Verification

### Automated Tests (6/6 Passing)

```bash
cd packages/sdk
npm test
```

**Coverage:**
- RecoveryManager (enable/disable recovery)
- CredentialManager (issue/verify credentials)  
- PaymentManager (RLUSD transfers)

### Manual Testnet Verification

```bash
npx tsx scripts/demo.ts
```

**What it does:**
1. Funds wallet on XRPL Testnet
2. Sets up social recovery (SignerListSet)
3. Issues verifiable credential (Memo anchoring)
4. Demonstrates RLUSD payment
5. **Prints clickable Testnet Explorer URLs** for every transaction

**Example Output:**
```
✅ Recovery Enabled!
   TxHash: 5BEF088A1D8B8CE39E294248AB1FDF95120F434D3D5FB1CB825044E6BBC1E361
   Explorer: https://testnet.xrpl.org/transactions/5BEF088A...

✅ Credential Anchored!
   Hash: 9449896A71E8C3FC50070FA23E515031524D7EF4B0CA1E39AE6F1AB69518085F
   TxHash: 61681BD4A84BFEF2334EC416899D8A47CDA33172E2821DE4E4952F0977FC11BF
   Explorer: https://testnet.xrpl.org/transactions/61681BD4...
```

---

## Development

### Prerequisites
- Node.js >= 20.11.0 (see `.nvmrc`)
- npm >= 10.0.0

### Setup

```bash
# Use correct Node version
nvm use

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Run demo verification
cd packages/sdk
npx tsx scripts/demo.ts
```

---

## API Documentation

### RecoveryManager

**`enableRecovery(wallet, signers[], quorum)`**  
Sets up SignerListSet for social recovery.

**Parameters:**
- `wallet`: Wallet - Account to protect
- `signers`: string[] - Guardian addresses
- `quorum`: number - Signatures required

**Returns:** `Promise<string>` - Transaction hash

**Example:**
```typescript
const txHash = await sdk.recovery.enableRecovery(
  wallet,
  ['rGuardian1...', 'rGuardian2...'],
  2 // Both must sign
);
```

**`initiateRecovery(accountAddress, newRegularKey?)`**  
Creates recovery transaction template for guardians to sign.

**`monitorTransaction(txHash)`**  
Monitors transaction validation status.

---

### CredentialManager

**`issueCredential(issuerWallet, credential)`**  
Issues verifiable credential with on-chain hash anchoring.

**Parameters:**
- `issuerWallet`: Wallet - Issuer's wallet
- `credential`: VerifiableCredential - W3C credential object

**Returns:** `Promise<{ hash: string, txHash: string }>`

**Example:**
```typescript
const result = await sdk.credentials.issueCredential(wallet, {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiableCredential'],
  issuer: `did:chainauth:${wallet.address}`,
  credentialSubject: { kycVerified: true }
});
```

**`verifyCredential(credential, txHash)`**  
Verifies credential hash against on-chain anchor.

---

### PaymentManager

**`sendRLUSD(wallet, amount, destination, issuer, currency)`**  
Sends RLUSD (or other issued currency) payment.

**Example:**
```typescript
await sdk.payments.sendRLUSD(
  wallet,
  '100',
  'rRecipient...',
  'rIssuer...',
  'RLUSD'
);
```

---

## Use Cases

### 1. Aid Distribution Platform
- NGO issues verification credentials to recipients
- Recipients receive RLUSD stablecoin aid
- Social recovery protects beneficiary accounts

### 2. DeFi Identity Layer
- KYC credentials anchored on XRPL
- Multi-device access via social recovery
- Portable identity across dApps

### 3. DAO Membership
- Issue governance credentials
- Multi-sig treasury recovery
- On-chain proof of participation

---

## Team Responsibilities

- **Member 1**: SDK Core - Engine (`packages/sdk/src/core/`)
- **Member 2**: SDK Features - Logic (`packages/sdk/src/features/`)
- **Member 3**: Frontend Demo App (`apps/demo-app/`)
- **Member 4**: Configuration, Types & Documentation

---
