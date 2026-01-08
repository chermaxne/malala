export class ChainAuthError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'ChainAuthError';
    }
}
export class RecoveryError extends ChainAuthError {
    constructor(message) {
        super(message, 'RECOVERY_ERROR');
        this.name = 'RecoveryError';
    }
}
export class CredentialError extends ChainAuthError {
    constructor(message) {
        super(message, 'CREDENTIAL_ERROR');
        this.name = 'CredentialError';
    }
}
export class PaymentError extends ChainAuthError {
    constructor(message) {
        super(message, 'PAYMENT_ERROR');
        this.name = 'PaymentError';
    }
}
export class ValidationError extends ChainAuthError {
    constructor(message) {
        super(message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
//# sourceMappingURL=errors.js.map