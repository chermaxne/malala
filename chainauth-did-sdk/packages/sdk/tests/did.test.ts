// did.test.ts - Tests for DID functionality
import { describe, it, expect } from 'vitest';
import { DIDManager } from '../src/core/did';

import { XRPLClient } from '../src/core/client';

describe('DIDManager', () => {
  it('should create a DID manager instance', () => {
    const client = new XRPLClient('wss://test');
    const didManager = new DIDManager(client);
    expect(didManager).toBeDefined();
  });

  // TODO: Add more tests
});
