// validators.ts - Validation utilities
export const isValidDID = (did: string): boolean => {
  return did.startsWith('did:xrpl:');
};

export const isValidXRPLAddress = (address: string): boolean => {
  // TODO: Implement proper XRPL address validation
  return address.length > 0;
};
