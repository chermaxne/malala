import { Wallet } from 'xrpl';
import { XRPLClient } from '../core/client';
export declare class RecoveryManager {
    private client;
    constructor(client: XRPLClient);
    /**
     * Enable social recovery by configuring SignerListSet
     * @param wallet The account to enable recovery for
     * @param signers List of recovery signer addresses
     * @param quorum Minimum weight required to sign (default: equivalent to majority)
     */
    enableRecovery(wallet: Wallet, signers: string[], quorum?: number): Promise<string>;
    /**
     * Disable recovery by removing SignerList
     */
    disableRecovery(wallet: Wallet): Promise<string>;
    /**
     * Sign a transaction for recovery purposes (multi-sig).
     * @param txJSON The transaction JSON to sign
     * @param signerWallet The wallet of the signer
     */
    signForRecovery(txJSON: any, signerWallet: Wallet): Promise<{
        tx_blob: string;
        id: string;
    }>;
    /**
     * Initiate account recovery by creating a transaction template
     * @param recoveredAccount The account being recovered
     * @param newRegularKey The new regular key to set (optional)
     * @returns Prepared transaction JSON for signers to sign
     */
    initiateRecovery(recoveredAccount: string, newRegularKey?: string): Promise<any>;
    /**
     * Combine multiple signatures and submit recovery transaction
     * @param signedBlobs Array of signed transaction blobs from signers
     * @returns Transaction hash if successful
     */
    combineSignatures(signedBlobs: string[]): Promise<string>;
    /**
     * Monitor transaction status on the ledger
     * @param txHash Transaction hash to monitor
     * @returns Transaction status and metadata
     */
    monitorTransaction(txHash: string): Promise<{
        validated: boolean;
        status: string;
        ledgerIndex?: number;
    }>;
    /**
     * Get account information including RegularKey
     * @param account The XRPL account address to query
     * @returns Account information including RegularKey if set
     */
    getAccountInfo(account: string): Promise<{
        account: string;
        balance: string;
        regularKey?: string;
        signerList?: Array<{
            account: string;
            weight: number;
        }>;
    }>;
}
