import { Wallet, Payment, convertStringToHex } from 'xrpl';
import { createHash } from 'crypto';
import { XRPLClient } from '../core/client';
import { CredentialError } from '../utils/errors';
import { VerifiableCredential } from '../types';

export class CredentialManager {
  constructor(private client: XRPLClient) { }

  /**
   * Issue a VC by anchoring its hash on XRPL
   * @param issuerWallet The wallet issuing the credential
   * @param credential The credential object
   */
  async issueCredential(
    issuerWallet: Wallet,
    credential: VerifiableCredential
  ): Promise<{ hash: string; txHash: string }> {
    // 1. Hash the credential (canonical stringify is ideal, but JSON.stringify for MVP)
    const credString = JSON.stringify(credential);
    const hash = createHash('sha256').update(credString).digest('hex').toUpperCase();

    // 2. Anchor on XRPL via Memo
    // Send 1 drop to self to carry the memo
    const tx: Payment = {
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
      const prepared = await client.autofill(tx);
      const signed = issuerWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      const meta = result.result.meta;
      if (!meta || typeof meta === 'string' || meta.TransactionResult !== 'tesSUCCESS') {
        throw new CredentialError(`Anchoring failed: ${meta ? (typeof meta === 'string' ? meta : meta.TransactionResult) : 'Unknown error'}`);
      }

      return { hash, txHash: result.result.hash };
    } catch (error: any) {
      throw new CredentialError(`Credential issuance failed: ${error.message}`);
    }
  }

  /**
   * Verify a credential by checking if its hash is anchored by the issuer
   * @param credential The credential to verify
   * @param txHash The transaction hash where it was anchored (optional if inside proof)
   */
  async verifyCredential(credential: VerifiableCredential, txHash?: string): Promise<boolean> {
    const proofTxHash = txHash || credential.proof?.txHash;
    if (!proofTxHash) {
      throw new CredentialError("Transaction hash required for verification (passed as arg or in credential.proof.txHash)");
    }

    const credString = JSON.stringify(credential);
    const calculatedHash = createHash('sha256').update(credString).digest('hex').toUpperCase();

    return this.verifyAnchoredHash(proofTxHash, calculatedHash, credential.issuer);
  }

  /**
   * Check if a specific hash is anchored in a transaction by a specific issuer
   */
  async verifyAnchoredHash(txHash: string, targetHash: string, issuerAddress: string): Promise<boolean> {
    try {
      const client = this.client.getClient();
      const tx = await client.request({ command: 'tx', transaction: txHash });

      // Helper to access transaction fields safely
      const txData = tx.result as any;

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

      const hasMatchingMemo = memos.some((m: any) =>
        m.Memo && m.Memo.MemoData === targetHash
      );

      return hasMatchingMemo;
    } catch (error) {
      // Transaction not found or other error
      return false;
    }
  }
}
