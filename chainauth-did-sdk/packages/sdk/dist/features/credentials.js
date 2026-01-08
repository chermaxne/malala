import { convertStringToHex } from 'xrpl';
import { CredentialError } from '../utils/errors';
/**
 * Browser-compatible SHA256 hash function using Web Crypto API
 */
async function sha256Hash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.toUpperCase();
}
export class CredentialManager {
    constructor(client) {
        this.client = client;
    }
    /**
     * Issue a VC by anchoring its hash on XRPL
     * @param issuerWallet The wallet issuing the credential
     * @param credential The credential object
     */
    async issueCredential(issuerWallet, credential) {
        // 1. Hash the credential (canonical stringify is ideal, but JSON.stringify for MVP)
        const credString = JSON.stringify(credential);
        const hash = await sha256Hash(credString);
        // 2. Anchor on XRPL via Memo
        // Send 1 drop to self to carry the memo
        const tx = {
            TransactionType: 'Payment',
            Account: issuerWallet.address,
            Destination: issuerWallet.address,
            Amount: '1', // 1 drop
            Memos: [
                {
                    Memo: {
                        MemoType: convertStringToHex('ChainAuth:Credential'),
                        MemoData: hash
                    }
                }
            ]
        };
        try {
            const client = this.client.getClient();
            // Get latest ledger index to set robust timeout
            const ledgerIndex = await client.getLedgerIndex();
            tx.Fee = '5000'; // Boost fee to 0.005 XRP
            const prepared = await client.autofill(tx);
            // Set LastLedgerSequence AFTER autofill to prevent override
            prepared.LastLedgerSequence = ledgerIndex + 200;
            const signed = issuerWallet.sign(prepared);
            // Use submit() instead of submitAndWait() to avoid Testnet congestion hangs
            const submitResult = await client.submit(signed.tx_blob);
            // Check if submission was accepted by the network
            // tes = success, ter = retry, tem = malformed but submitted
            const result = submitResult.result.engine_result;
            if (!result.startsWith('tes') && !result.startsWith('ter') && !result.startsWith('tem')) {
                throw new CredentialError(`Transaction submission failed: ${result}`);
            }
            return { hash, txHash: signed.hash };
        }
        catch (error) {
            throw new CredentialError(`Credential issuance failed: ${error.message}`);
        }
    }
    /**
     * Verify a credential by checking if its hash is anchored by the issuer
     * @param credential The credential to verify
     * @param txHash The transaction hash where it was anchored (optional if inside proof)
     */
    async verifyCredential(credential, txHash) {
        const proofTxHash = txHash || credential.proof?.txHash;
        if (!proofTxHash) {
            throw new CredentialError("Transaction hash required for verification (passed as arg or in credential.proof.txHash)");
        }
        const credString = JSON.stringify(credential);
        const calculatedHash = await sha256Hash(credString);
        return this.verifyAnchoredHash(proofTxHash, calculatedHash, credential.issuer);
    }
    /**
     * Check if a specific hash is anchored in a transaction by a specific issuer
     */
    async verifyAnchoredHash(txHash, targetHash, issuerAddress) {
        try {
            const client = this.client.getClient();
            const tx = await client.request({ command: 'tx', transaction: txHash });
            // Helper to access transaction fields safely
            const txData = tx.result;
            // 1. Verify Issuer
            if (txData.Account !== issuerAddress) {
                return false;
            }
            // 2. Verify Memo
            // Memos are array of objects with Memo property
            const memos = txData.Memos;
            if (!memos || !Array.isArray(memos)) {
                return false;
            }
            const hasMatchingMemo = memos.some((m) => m.Memo && m.Memo.MemoData === targetHash);
            return hasMatchingMemo;
        }
        catch (error) {
            // Transaction not found or other error
            return false;
        }
    }
}
//# sourceMappingURL=credentials.js.map