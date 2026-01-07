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
    // Inject client into managers
    this.did = new DIDManager(this.client);
    this.wallet = new WalletManager();
    // Assuming RecoveryManager and CredentialManager will eventually need client too, 
    // but for now keeping them as is or updating if they accept it.
    // Based on "Member 4" tip, we should probably pass it if they support it, 
    // but their current implementation (read previously) didn't show constructors.
    // I'll stick to what I know: DIDManager needs it.
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
