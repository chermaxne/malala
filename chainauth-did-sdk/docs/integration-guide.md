# ChainAuth SDK Integration Guide

## Installation

```bash
npm install @chainauth/sdk
```

## Quick Start

### 1. Initialize the SDK

```typescript
import { ChainAuthSDK } from '@chainauth/sdk';

const sdk = new ChainAuthSDK({
  xrplServerUrl: 'wss://s.altnet.rippletest.net:51233',
  network: 'testnet'
});

await sdk.connect();
```

### 2. Create a Wallet

```typescript
const wallet = sdk.wallet.generateWallet();
console.log('Address:', wallet.address);
console.log('Seed:', wallet.seed);
```

### 3. Create a DID

```typescript
const did = await sdk.did.createDID(wallet.address);
console.log('DID:', did);
```

### 4. Set Up Account Recovery

```typescript
const guardians = ['rAddress1...', 'rAddress2...', 'rAddress3...'];
await sdk.recovery.setupRecovery(wallet.address, guardians, 2);
```

### 5. Issue Verifiable Credentials

```typescript
const credential = await sdk.credentials.issueCredential(
  issuerDID,
  subjectDID,
  {
    name: 'John Doe',
    age: 30
  }
);
```

## React Integration

See the demo app for a complete example of integrating ChainAuth SDK in a React application.

```typescript
import { useChainAuth } from './hooks/useChainAuth';

function MyComponent() {
  const { isAuthenticated } = useChainAuth();
  
  return (
    <div>
      {isAuthenticated ? 'Logged in' : 'Not logged in'}
    </div>
  );
}
```

## Best Practices

1. **Secure Storage**: Never expose private keys or seeds in client-side code
2. **Error Handling**: Always wrap SDK calls in try-catch blocks
3. **Connection Management**: Properly disconnect when done
4. **Testing**: Use testnet for development and testing

## Troubleshooting

### Common Issues

- **Connection Errors**: Check your XRPL server URL and network connectivity
- **Transaction Failures**: Ensure sufficient XRP balance for fees
- **DID Resolution**: Verify the DID format and network

For more help, see the API Reference or open an issue on GitHub.
