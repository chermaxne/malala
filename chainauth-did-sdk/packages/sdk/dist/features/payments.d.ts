import { Wallet } from 'xrpl';
import { XRPLClient } from '../core/client';
export declare class PaymentManager {
    private client;
    constructor(client: XRPLClient);
    /**
     * Send RLUSD (or other issued currency) to a destination
     * @param wallet The sender's wallet
     * @param amount The amount to send
     * @param destination The destination address
     * @param issuer The issuer address (default: common testnet issuer or placeholder)
     * @param currency The currency code (default: RLUSD)
     */
    sendRLUSD(wallet: Wallet, amount: string, destination: string, issuer: string, currency?: string): Promise<string>;
    /**
     * Verify a payment transaction
     * @param txHash The transaction hash to verify
     */
    verifyPayment(txHash: string): Promise<{
        validated: boolean;
        meta: any;
    }>;
}
