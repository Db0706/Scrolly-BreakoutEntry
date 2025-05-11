import { Connection } from '@solana/web3.js';
import createEdgeClient from '@honeycomb-protocol/edge-client';

// Define the Honeycomb test network RPC endpoint
const RPC_URL = "https://rpc.test.honeycombprotocol.com";

// Create and export the Solana connection
export const connection = new Connection(RPC_URL, 'confirmed');

// Create and export the Honeycomb client using the connection
export const client = createEdgeClient(RPC_URL, true);
