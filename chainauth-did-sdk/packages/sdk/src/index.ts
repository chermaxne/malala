// index.ts - Main entry point for the ChainAuth SDK
export * from './core/client';
export * from './core/did';
export * from './core/wallet';
export * from './features/recovery';
export * from './features/credentials';
export * from './features/payments'; // Export PaymentManager
export * from './types';
export * from './utils';

// Main SDK class
import { XRPLClient } from './core/client';
import { DIDManager } from './core/did';
import { WalletManager } from './core/wallet';
import { RecoveryManager } from './features/recovery';
import { CredentialManager } from './features/credentials';
import { PaymentManager } from './features/payments';
import { ChainAuthConfig } from './types';

export class ChainAuthSDK {
  private client: XRPLClient;
  public did: DIDManager;
  public wallet: WalletManager;
  public recovery: RecoveryManager;
  public credentials: CredentialManager;
  public payments: PaymentManager;

  constructor(config: ChainAuthConfig) {
    this.client = new XRPLClient(config.xrplServerUrl);

    // Initialize all managers with XRPLClient
    this.did = new DIDManager(this.client);
    this.wallet = new WalletManager();
    this.recovery = new RecoveryManager(this.client);
    this.credentials = new CredentialManager(this.client);
    this.payments = new PaymentManager(this.client);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  // Expose client if needed
  getXRPLClient(): XRPLClient {
    return this.client;
  }
}
