// scripts/checkMintAuthority.js

require("dotenv").config();

const createEdgeClient = require("@honeycomb-protocol/edge-client").default;
const { Connection, PublicKey } = require("@solana/web3.js");

;(async () => {
  // 1) Load your Honeycomb resource address from env
  const resourceAddress = process.env.GAMER_TOKEN_MINT_ADDRESS;
  if (!resourceAddress) {
    console.error("❌ Please set GAMER_TOKEN_MINT_ADDRESS in your .env.local");
    process.exit(1);
  }

  // 2) Init Honeycomb client and fetch the resource metadata
  const client = createEdgeClient(
    process.env.NEXT_PUBLIC_HONEYCOMB_API_URL,
    true
  );
  const { resources } = await client.findResources({
    addresses: [resourceAddress],
  });
  if (!resources || resources.length === 0) {
    console.error("❌ No resource found at", resourceAddress);
    process.exit(1);
  }

  // 3) Extract the underlying SPL mint address
  const mintAddress = resources[0].mint;
  console.log("🔖 Underlying SPL mint:", mintAddress);

  // 4) Connect to Honeycomb’s Testnet RPC and fetch that mint account
  const rpcUrl =
    process.env.HONEYCOMB_RPC_URL ||
    "https://rpc.test.honeycombprotocol.com/";
  const conn = new Connection(rpcUrl, "confirmed");
  const parsed = await conn.getParsedAccountInfo(new PublicKey(mintAddress));
  if (!parsed.value) {
    console.error("❌ Failed to fetch on-chain data for mint", mintAddress);
    process.exit(1);
  }

  // 5) Print the mintAuthority field
  const mintInfo = parsed.value.data.parsed.info;
  console.log("🔐 On-chain mintAuthority:", mintInfo.mintAuthority);
})().catch((err) => {
  console.error("Error checking mint authority:", err);
  process.exit(1);
});
