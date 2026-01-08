// formatters.ts - Formatting utilities
export const formatDID = (address) => {
    return `did:xrpl:${address}`;
};
export const extractAddressFromDID = (did) => {
    return did.replace('did:xrpl:', '');
};
//# sourceMappingURL=formatters.js.map