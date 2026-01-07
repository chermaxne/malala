import { Wallet, Payment, convertStringToHex } from 'xrpl';
import { XRPLClient } from '../core/client';
import { PaymentError } from '../utils/errors';
import { PaymentSchema } from '../utils/validation';

export class PaymentManager {
    constructor(private client: XRPLClient) { }

    /**
     * Send RLUSD (or other issued currency) to a destination
     * @param wallet The sender's wallet
     * @param amount The amount to send
     * @param destination The destination address
     * @param issuer The issuer address (default: common testnet issuer or placeholder)
     * @param currency The currency code (default: RLUSD)
     */
    async sendRLUSD(
        wallet: Wallet,
        amount: string,
        destination: string,
        issuer: string,
        currency: string = 'RLUSD'
    ): Promise<string> {
        // Handle 5+ char currency codes by converting to hex
        const currencyCode = currency.length > 3 ? convertStringToHex(currency).padEnd(40, '0') : currency;

        const validationResult = PaymentSchema.safeParse({
            destination,
            amount,
            currency: currencyCode // Validate the formatted code? Schema says 3 or 40.
        });

        if (!validationResult.success) {
            throw new PaymentError(`Invalid payment details: ${validationResult.error.message}`);
        }

        const payment: Payment = {
            TransactionType: 'Payment',
            Account: wallet.address,
            Destination: destination,
            Amount: {
                currency: currencyCode,
                value: amount,
                issuer: issuer
            }
        };

        try {
            const client = this.client.getClient();

            const prepared = await client.autofill(payment);
            const signed = wallet.sign(prepared);
            const result = await client.submitAndWait(signed.tx_blob);

            const meta = result.result.meta;
            if (!meta || typeof meta === 'string' || meta.TransactionResult !== 'tesSUCCESS') {
                throw new PaymentError(`Payment failed: ${meta ? (typeof meta === 'string' ? meta : meta.TransactionResult) : 'Unknown error'}`);
            }

            return result.result.hash;
        } catch (error: any) {
            throw new PaymentError(`Payment execution failed: ${error.message}`);
        }
    }

    /**
     * Verify a payment transaction
     * @param txHash The transaction hash to verify
     */
    async verifyPayment(txHash: string): Promise<{ validated: boolean; meta: any }> {
        try {
            const client = this.client.getClient();
            const tx = await client.request({
                command: 'tx',
                transaction: txHash
            });

            return {
                validated: tx.result.validated || false,
                meta: tx.result.meta
            };
        } catch (error: any) {
            throw new PaymentError(`Payment verification failed: ${error.message}`);
        }
    }
}
