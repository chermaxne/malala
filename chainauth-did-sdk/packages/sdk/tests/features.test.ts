import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChainAuthSDK } from '../src/index';
import { XRPLClient } from '../src/core/client';
import { Wallet } from 'xrpl';

// Mock XRPL Client
const mockSubmitAndWait = vi.fn();
const mockAutofill = vi.fn();
const mockRequest = vi.fn();
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('../src/core/client', () => {
    return {
        XRPLClient: vi.fn().mockImplementation(() => ({
            getClient: () => ({
                submitAndWait: mockSubmitAndWait,
                autofill: mockAutofill,
                request: mockRequest,
                connect: mockConnect,
                disconnect: mockDisconnect
            }),
            connect: mockConnect,
            disconnect: mockDisconnect
        }))
    };
});

describe('ChainAuth SDK Features', () => {
    let sdk: ChainAuthSDK;
    let wallet: Wallet;

    beforeEach(() => {
        vi.clearAllMocks();
        sdk = new ChainAuthSDK({ xrplServerUrl: 'wss://s.altnet.rippletest.net:51233', network: 'testnet' });
        wallet = Wallet.generate();

        // Default mock behaviors
        mockAutofill.mockImplementation((tx) => Promise.resolve(tx));
        mockSubmitAndWait.mockResolvedValue({
            result: { meta: { TransactionResult: 'tesSUCCESS' }, hash: 'TEST_TX_HASH' }
        });
    });

    describe('RecoveryManager', () => {
        it('should enable recovery logic', async () => {
            // Generate valid addresses
            const s1 = Wallet.generate().address;
            const s2 = Wallet.generate().address;
            const signers = [s1, s2];
            const hash = await sdk.recovery.enableRecovery(wallet, signers, 2);

            expect(hash).toBe('TEST_TX_HASH');
            expect(mockAutofill).toHaveBeenCalledWith(expect.objectContaining({
                TransactionType: 'SignerListSet',
                SignerQuorum: 2
            }));
        });

        it('should disable recovery', async () => {
            await sdk.recovery.disableRecovery(wallet);
            expect(mockAutofill).toHaveBeenCalledWith(expect.objectContaining({
                TransactionType: 'SignerListSet',
                SignerQuorum: 0
            }));
        });
    });

    describe('CredentialManager', () => {
        it('should issue credential', async () => {
            const cred = {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: 'did:chainauth:123',
                type: ['VerifiableCredential'],
                issuer: 'did:chainauth:issuer',
                issuanceDate: new Date().toISOString(),
                credentialSubject: { id: 'did:chainauth:subject' },
                proof: {}
            };

            const result = await sdk.credentials.issueCredential(wallet, cred);

            expect(result.hash).toBeDefined();
            expect(result.txHash).toBe('TEST_TX_HASH');
            expect(mockAutofill).toHaveBeenCalledWith(expect.objectContaining({
                TransactionType: 'Payment',
                Memos: expect.arrayContaining([
                    expect.objectContaining({
                        Memo: expect.objectContaining({
                            MemoData: result.hash
                        })
                    })
                ])
            }));
        });
    });

    describe('PaymentManager', () => {
        it('should send RLUSD', async () => {
            const dest = Wallet.generate().address;
            const amount = '100';
            const issuer = Wallet.generate().address;

            await sdk.payments.sendRLUSD(wallet, amount, dest, issuer, 'RLUSD');

            expect(mockAutofill).toHaveBeenCalledWith(expect.objectContaining({
                TransactionType: 'Payment',
                Amount: expect.objectContaining({
                    currency: '524C555344000000000000000000000000000000', // HEX for RLUSD
                    value: amount,
                    issuer: issuer
                })
            }));
        });
    });
});
