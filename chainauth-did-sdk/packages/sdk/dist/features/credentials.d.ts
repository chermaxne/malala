import { Wallet } from 'xrpl';
import { XRPLClient } from '../core/client';
import { VerifiableCredential } from '../types';
export declare class CredentialManager {
    private client;
    constructor(client: XRPLClient);
    /**
     * Issue a VC by anchoring its hash on XRPL
     * @param issuerWallet The wallet issuing the credential
     * @param credential The credential object
     */
    issueCredential(issuerWallet: Wallet, credential: VerifiableCredential): Promise<{
        hash: string;
        txHash: string;
    }>;
    /**
     * Verify a credential by checking if its hash is anchored by the issuer
     * @param credential The credential to verify
     * @param txHash The transaction hash where it was anchored (optional if inside proof)
     */
    verifyCredential(credential: VerifiableCredential, txHash?: string): Promise<boolean>;
    /**
     * Check if a specific hash is anchored in a transaction by a specific issuer
     */
    verifyAnchoredHash(txHash: string, targetHash: string, issuerAddress: string): Promise<boolean>;
}
