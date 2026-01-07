# ChainAuth DID SDK

A comprehensive SDK for decentralized identity management on the XRP Ledger using XLS-40d (DID) and XLS-70d (Verifiable Credentials).

## Project Structure

```
chainauth-did-sdk/
├── apps/
│   └── demo-app/          # Frontend demo application
├── packages/
│   └── sdk/               # Core SDK package
├── docs/                  # Documentation
└── turbo.json            # Build pipeline configuration
```

## Team Responsibilities

- **Member 1**: SDK Core - Engine (`packages/sdk/src/core/`)
- **Member 2**: SDK Features - Logic (`packages/sdk/src/features/`)
- **Member 3**: Frontend Demo App (`apps/demo-app/`)
- **Member 4**: Configuration, Types & Documentation

## Getting Started

### Prerequisites

- Node.js >= 20.11.0 (see `.nvmrc`)
- npm >= 10.0.0

### Installation

```bash
# Use the correct Node version
nvm use

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Start development
npm run dev
```

## Features

- Decentralized Identity (DID) using XLS-40d
- Verifiable Credentials using XLS-70d
- Multi-signature account recovery
- Secure wallet management
- React integration hooks

## Documentation

- [API Reference](./docs/api-reference.md)
- [Integration Guide](./docs/integration-guide.md)
- [Architecture Diagrams](./docs/diagrams/)

## License

MIT
