// client.ts - XRPL Client setup
import { Client } from 'xrpl';

export class XRPLClient {
  private client: Client;

  constructor(serverUrl: string) {
    this.client = new Client(serverUrl);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  getClient(): Client {
    return this.client;
  }
}
