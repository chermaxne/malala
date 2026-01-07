// formatters.ts - Formatting utilities
export const formatDID = (address: string): string => {
  return `did:xrpl:${address}`;
};

export const extractAddressFromDID = (did: string): string => {
  return did.replace('did:xrpl:', '');
};
