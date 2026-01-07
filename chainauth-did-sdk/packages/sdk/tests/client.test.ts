// client.test.ts - Tests for XRPL client
import { describe, it, expect } from 'vitest';
import { XRPLClient } from '../src/core/client';

describe('XRPLClient', () => {
  it('should create a client instance', () => {
    const client = new XRPLClient('wss://s.altnet.rippletest.net:51233');
    expect(client).toBeDefined();
  });

  // TODO: Add more tests
});
