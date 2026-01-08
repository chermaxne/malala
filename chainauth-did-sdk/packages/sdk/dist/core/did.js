// did.ts - XLS-40d (DID) Logic
import { convertStringToHex, convertHexToString } from 'xrpl';
export class DIDManager {
    constructor(client) {
        this.client = client;
    }
    /**
     * Create or Update a DID on XRPL using XLS-40d (DIDSet)
     * @param wallet The wallet signing the transaction
     * @param uri The DID Document URI (e.g., ipfs://... or https://...)
     */
    async registerDID(wallet, uri) {
        const tx = {
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
    async resolveDID(did) {
        const parts = did.split(':');
        const address = parts[parts.length - 1]; // Naive parsing for 'did:xrpl:network:address'
        const request = {
            command: 'account_objects',
            account: address,
            type: 'did'
        };
        const response = await this.client.getClient().request(request);
        if (response.result.account_objects.length === 0) {
            return null;
        }
        const didObject = response.result.account_objects[0];
        const didData = didObject;
        if (didData.URI) {
            return convertHexToString(didData.URI);
        }
        return null;
    }
    /**
     * Delete DID (Empty URI)
     */
    async deleteDID(wallet) {
        const tx = {
            TransactionType: 'DIDSet',
            Account: wallet.address,
            URI: ''
        };
        await this.client.submitAndWait(tx, wallet);
    }
    /**
     * Verify that a DID exists on-chain
     * @param did The DID to verify (e.g., did:xrpl:1:rAddress...)
     * @returns Object with verification status and DID document URI if found
     */
    async verifyDID(did) {
        const parts = did.split(':');
        if (parts.length < 4 || parts[0] !== 'did' || parts[1] !== 'xrpl') {
            return {
                exists: false,
                uri: null,
                address: '',
                message: 'Invalid DID format. Expected: did:xrpl:network:address'
            };
        }
        const address = parts[3];
        try {
            const uri = await this.resolveDID(did);
            if (!uri) {
                return {
                    exists: false,
                    uri: null,
                    address,
                    message: 'DID not found on XRPL. Account may not have a DID registered.'
                };
            }
            return {
                exists: true,
                uri,
                address,
                message: 'DID successfully verified on XRPL'
            };
        }
        catch (error) {
            return {
                exists: false,
                uri: null,
                address,
                message: `Verification failed: ${error.message}`
            };
        }
    }
}
//# sourceMappingURL=did.js.map