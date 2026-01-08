import { Wallet } from 'xrpl';
export declare class WalletManager {
    /**
     * Generate a new XRPL wallet
     */
    generateWallet(): Wallet;
    /**
     * Import wallet from seed
     */
    fromSeed(seed: string): Wallet;
    /**
     * Generate a challenge message for signature verification
     */
    generateChallenge(): string;
    /**
     * Sign a challenge message with wallet
     * Creates a verifiable signature using the wallet's private key
     */
    signChallenge(wallet: Wallet, challenge: string): {
        signature: string;
        publicKey: string;
    };
    /**
     * Verify that a signature matches the expected public key
     * In a real system, this would use cryptographic verification
     */
    verifySignature(publicKey: string, challenge: string, signature: string): boolean;
    /**
     * Securely store wallet credentials
     */
    storeWallet(wallet: Wallet): Promise<void>;
    /**
     * Retrieve stored wallet
     */
    retrieveWallet(): Promise<Wallet | null>;
}
