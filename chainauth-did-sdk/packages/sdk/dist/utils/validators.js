// validators.ts - Validation utilities
export const isValidDID = (did) => {
    return did.startsWith('did:xrpl:');
};
export const isValidXRPLAddress = (address) => {
    // TODO: Implement proper XRPL address validation
    return address.length > 0;
};
//# sourceMappingURL=validators.js.map