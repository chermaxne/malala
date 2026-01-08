export interface ChainAuthConfig {
    xrplServerUrl: string;
    network: 'mainnet' | 'testnet' | 'devnet';
}
export interface DIDDocument {
    id: string;
    controller: string;
    verificationMethod: VerificationMethod[];
    authentication: string[];
}
export interface VerificationMethod {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
}
export interface VerifiableCredential {
    '@context': string[];
    id: string;
    type: string[];
    issuer: string;
    issuanceDate: string;
    credentialSubject: any;
    proof: any;
}
export interface RecoveryConfig {
    signers: string[];
    quorum: number;
}
