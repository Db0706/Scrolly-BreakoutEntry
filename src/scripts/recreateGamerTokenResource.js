//src/scripts/recreateGamerTokenResource.js

require("dotenv").config();

const createEdgeClient = require("@honeycomb-protocol/edge-client").default;
const { Keypair, Connection, clusterApiUrl, Transaction } = require("@solana/web3.js");
const bs58 = require("bs58");

(async () => {
  // 1) Load your dev‐wallet key from ADMIN_SECRET_KEY_BASE58
  if (!process.env.ADMIN_SECRET_KEY_BASE58) {
    console.error("❌ Set ADMIN_SECRET_KEY_BASE58 in your .env.local");
    process.exit(1);
  }
  const ADMIN = Keypair.fromSecretKey(
    bs58.decode(process.env.ADMIN_SECRET_KEY_BASE58)
  );

  // 2) Init Honeycomb client
  const client = createEdgeClient(
    process.env.NEXT_PUBLIC_HONEYCOMB_API_URL,
    true
  );

  // 3) Build the “new resource” transaction
  const { createCreateNewResourceTransaction } =
    await client.createCreateNewResourceTransaction(
      {
        project:   process.env.NEXT_PUBLIC_HONEYCOMB_PROJECT,      // your project address
        authority: ADMIN.publicKey.toBase58(),                     // sets metadata authority
        payer:     ADMIN.publicKey.toBase58(),
        params: {
          name:     "Gamer Token",
          symbol:   "GMR",
          uri:      "https://ddgaming.fun",
          decimals: 6,
          storage:  "LedgerState",    // fungible token
        },
      },
      {
        fetchOptions: {
          headers: {
            // If your API needs it, include a Bearer token here:
            // authorization: `Bearer ${process.env.NEXT_PUBLIC_HONEYCOMB_DEBUG_TOKEN}`
          },
        },
      }
    );

  // 4) Sign & send it on Devnet
  const tx = createCreateNewResourceTransaction.tx;
  tx.sign(ADMIN);
  const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
  const sig = await conn.sendRawTransaction(tx.serialize());
  await conn.confirmTransaction(sig);
  console.log("✅ Resource creation TX:", sig);

  // 5) Fetch back all resources in your project and pick the one you just made
  const { resources } = await client.findResources({
    projects: [process.env.NEXT_PUBLIC_HONEYCOMB_PROJECT],
  });
  const mine = resources.find(
    (r) => r.authority === ADMIN.publicKey.toBase58() && r.symbol === "GMR"
  );

  if (!mine) {
    console.error("❌ Could not find the newly created resource in project");
    process.exit(1);
  }

  console.log("🎟️  New resource address:", mine.address);
  console.log("➡️  Copy that address into GAMER_TOKEN_MINT_ADDRESS in your `.env.local`");
})();
