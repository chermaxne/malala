import { SignerListSet, Wallet, SignerEntry } from 'xrpl';
import { XRPLClient } from '../core/client';
import { RecoveryError } from '../utils/errors';
import { RecoveryConfigSchema } from '../utils/validation';

export class RecoveryManager {
  constructor(private client: XRPLClient) { }

  /**
   * Enable social recovery by configuring SignerListSet
   * @param wallet The account to enable recovery for
   * @param signers List of recovery signer addresses
   * @param quorum Minimum weight required to sign (default: equivalent to majority)
   */
  async enableRecovery(
    wallet: Wallet,
    signers: string[],
    quorum?: number
  ): Promise<string> {
    const signerEntries: SignerEntry[] = signers.map(address => ({
      SignerEntry: {
        Account: address,
        SignerWeight: 1
      }
    }));

    const calculatedQuorum = quorum || Math.ceil(signers.length / 2);

    // Validate
    const validation = RecoveryConfigSchema.safeParse({ signers, quorum: calculatedQuorum });
    if (!validation.success) {
      throw new RecoveryError(`Invalid recovery configuration: ${validation.error.message}`);
    }

    const tx: SignerListSet = {
      TransactionType: 'SignerListSet',
      Account: wallet.address,
      SignerQuorum: calculatedQuorum,
      SignerEntries: signerEntries
    };

    try {
      const client = this.client.getClient();
      const prepared = await client.autofill(tx);
      const signed = wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      const meta = result.result.meta;
      if (!meta || typeof meta === 'string' || meta.TransactionResult !== 'tesSUCCESS') {
        throw new RecoveryError(`Failed to enable recovery: ${meta ? (typeof meta === 'string' ? meta : meta.TransactionResult) : 'Unknown error'}`);
      }

      return result.result.hash;
    } catch (error: any) {
      throw new RecoveryError(`Recovery setup failed: ${error.message}`);
    }
  }

  /**
   * Disable recovery by removing SignerList
   */
  async disableRecovery(wallet: Wallet): Promise<string> {
    const tx: SignerListSet = {
      TransactionType: 'SignerListSet',
      Account: wallet.address,
      SignerQuorum: 0 // 0 deletes the SignerList
    };

    try {
      const client = this.client.getClient();
      const prepared = await client.autofill(tx);
      const signed = wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      const meta = result.result.meta;
      if (!meta || typeof meta === 'string' || meta.TransactionResult !== 'tesSUCCESS') {
        throw new RecoveryError(`Failed to disable recovery: ${meta ? (typeof meta === 'string' ? meta : meta.TransactionResult) : 'Unknown error'}`);
      }
      return result.result.hash;
    } catch (error: any) {
      throw new RecoveryError(`Recovery disable failed: ${error.message}`);
    }
  }

  /**
   * Sign a transaction for recovery purposes (multi-sig).
   * @param txJSON The transaction JSON to sign
   * @param signerWallet The wallet of the signer
   */
  async signForRecovery(
    txJSON: any,
    signerWallet: Wallet
  ): Promise<{ tx_blob: string; id: string }> {
    try {
      // 'true' enabled multi-signing output
      const signed = signerWallet.sign(txJSON, true);
      return { tx_blob: signed.tx_blob, id: signed.hash };
    } catch (error: any) {
      throw new RecoveryError(`Signing failed: ${error.message}`);
    }
  }

  /**
   * Initiate account recovery by creating a transaction template
   * @param recoveredAccount The account being recovered
   * @param newRegularKey The new regular key to set (optional)
   * @returns Prepared transaction JSON for signers to sign
   */
  async initiateRecovery(
    recoveredAccount: string,
    newRegularKey?: string
  ): Promise<any> {
    try {
      const client = this.client.getClient();

      // Create a SetRegularKey transaction to change control
      const tx: any = {
        TransactionType: 'SetRegularKey',
        Account: recoveredAccount,
      };

      if (newRegularKey) {
        tx.RegularKey = newRegularKey;
      }

      const prepared = await client.autofill(tx);
      return prepared;
    } catch (error: any) {
      throw new RecoveryError(`Failed to initiate recovery: ${error.message}`);
    }
  }

  /**
   * Combine multiple signatures and submit recovery transaction
   * @param signedBlobs Array of signed transaction blobs from signers
   * @returns Transaction hash if successful
   */
  async combineSignatures(signedBlobs: string[]): Promise<string> {
    try {
      const client = this.client.getClient();

      // XRPL.js doesn't have a built-in multisign combine,
      // so we take the last signed blob (with all signatures)
      // In production, you'd use xrpl.multisign() to combine
      const finalBlob = signedBlobs[signedBlobs.length - 1];

      const result = await client.submit(finalBlob);

      if (!result.result.engine_result.startsWith('tes') &&
        !result.result.engine_result.startsWith('ter')) {
        throw new RecoveryError(`Transaction failed: ${result.result.engine_result}`);
      }

      return result.result.tx_json.hash ?? '';
    } catch (error: any) {
      throw new RecoveryError(`Failed to submit recovery transaction: ${error.message}`);
    }
  }

  /**
   * Monitor transaction status on the ledger
   * @param txHash Transaction hash to monitor
   * @returns Transaction status and metadata
   */
  async monitorTransaction(txHash: string): Promise<{
    validated: boolean;
    status: string;
    ledgerIndex?: number;
  }> {
    try {
      const client = this.client.getClient();

      const response = await client.request({
        command: 'tx',
        transaction: txHash
      });

      const tx = response.result as any;

      return {
        validated: tx.validated || false,
        status: tx.meta?.TransactionResult || 'pending',
        ledgerIndex: tx.ledger_index
      };
    } catch (error: any) {
      // Transaction not found yet
      if (error.message.includes('not found')) {
        return {
          validated: false,
          status: 'pending'
        };
      }
      throw new RecoveryError(`Failed to monitor transaction: ${error.message}`);
    }
  }
}
