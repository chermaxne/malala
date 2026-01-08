import { Wallet } from 'xrpl';
import { XRPLClient } from './client';
export declare class DIDManager {
    private client;
    constructor(client: XRPLClient);
    /**
     * Create or Update a DID on XRPL using XLS-40d (DIDSet)
     * @param wallet The wallet signing the transaction
     * @param uri The DID Document URI (e.g., ipfs://... or https://...)
     */
    registerDID(wallet: Wallet, uri: string): Promise<{
        did: string;
        txHash: string;
    }>;
    /**
     * Resolve a DID to its DID Document URI
     * @param did The DID string (e.g., did:xrpl:1:rAddress...)
     */
    resolveDID(did: string): Promise<string | null>;
    /**
     * Delete DID (Empty URI)
     */
    deleteDID(wallet: Wallet): Promise<void>;
    /**
     * Verify that a DID exists on-chain
     * @param did The DID to verify (e.g., did:xrpl:1:rAddress...)
     * @returns Object with verification status and DID document URI if found
     */
    verifyDID(did: string): Promise<{
        exists: boolean;
        uri: string | null;
        address: string;
        message: string;
    }>;
}
