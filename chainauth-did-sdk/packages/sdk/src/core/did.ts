// did.ts - XLS-40d (DID) Logic
import { Wallet, DIDSet, convertStringToHex, convertHexToString, AccountObjectsRequest, AccountObjectsResponse } from 'xrpl';
import { XRPLClient } from './client';

export class DIDManager {
  private client: XRPLClient;

  constructor(client: XRPLClient) {
    this.client = client;
  }

  /**
   * Create or Update a DID on XRPL using XLS-40d (DIDSet)
   * @param wallet The wallet signing the transaction
   * @param uri The DID Document URI (e.g., ipfs://... or https://...)
   */
  async registerDID(wallet: Wallet, uri: string): Promise<{ did: string; txHash: string }> {
    const tx: DIDSet = {
      TransactionType: 'DIDSet',
      Account: wallet.address,
      URI: convertStringToHex(uri),
    };

    const result = await this.client.submitAndWait(tx, wallet);
    console.log(`DIDSet success: ${result.result.hash}`);

    // Return the standard DID format for XRPL
    return {
      did: `did:xrpl:1:${wallet.address}`,
      txHash: result.result.hash
    };
  }

  /**
   * Resolve a DID to its DID Document URI
   * @param did The DID string (e.g., did:xrpl:1:rAddress...)
   */
  async resolveDID(did: string): Promise<string | null> {
    const parts = did.split(':');
    const address = parts[parts.length - 1]; // Naive parsing for 'did:xrpl:network:address'

    const request: AccountObjectsRequest = {
      command: 'account_objects',
      account: address,
      type: 'did'
    };

    const response = await this.client.getClient().request(request) as AccountObjectsResponse;

    if (response.result.account_objects.length === 0) {
      return null;
    }

    const didObject = response.result.account_objects[0];

    const didData = didObject as any;

    if (didData.URI) {
      return convertHexToString(didData.URI);
    }

    return null;
  }

  /**
   * Delete DID (Empty URI)
   */
  async deleteDID(wallet: Wallet): Promise<void> {
    const tx: DIDSet = {
      TransactionType: 'DIDSet',
      Account: wallet.address,
      URI: ''
    };
    await this.client.submitAndWait(tx, wallet);
  }
}
