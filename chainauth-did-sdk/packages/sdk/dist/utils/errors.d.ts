export declare class ChainAuthError extends Error {
    code: string;
    constructor(message: string, code: string);
}
export declare class RecoveryError extends ChainAuthError {
    constructor(message: string);
}
export declare class CredentialError extends ChainAuthError {
    constructor(message: string);
}
export declare class PaymentError extends ChainAuthError {
    constructor(message: string);
}
export declare class ValidationError extends ChainAuthError {
    constructor(message: string);
}
