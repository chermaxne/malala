export * from './core/client';
export * from './core/did';
export * from './core/wallet';
export * from './features/recovery';
export * from './features/credentials';
export * from './features/payments';
export * from './types';
export * from './utils';
import { XRPLClient } from './core/client';
import { DIDManager } from './core/did';
import { WalletManager } from './core/wallet';
import { RecoveryManager } from './features/recovery';
import { CredentialManager } from './features/credentials';
import { PaymentManager } from './features/payments';
import { ChainAuthConfig } from './types';
export declare class ChainAuthSDK {
    private client;
    did: DIDManager;
    wallet: WalletManager;
    recovery: RecoveryManager;
    credentials: CredentialManager;
    payments: PaymentManager;
    constructor(config: ChainAuthConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getXRPLClient(): XRPLClient;
}
