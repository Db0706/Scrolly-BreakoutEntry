// createOGGamerBadge.ts
import { BadgesCondition } from '@honeycomb-protocol/edge-client';
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { PublicKey } from '@solana/web3.js';
import createEdgeClient from "@honeycomb-protocol/edge-client";

const edgeClient = createEdgeClient("https://edge.test.honeycombprotocol.com", true);

async function createOGGamerBadge(
  authorityPublicKey: PublicKey,
  projectAddress: PublicKey,
  payerPublicKey: PublicKey
): Promise<void> {
  try {
    const { createUpdateBadgeCriteriaTransaction } = await edgeClient.createUpdateBadgeCriteriaTransaction({
      args: {
        authority: authorityPublicKey.toString(), // Authority managing the badge (admin)
        projectAddress: projectAddress.toString(), // Project address where badge is created
        payer: payerPublicKey.toString(), // Who pays for the transaction fees
        criteriaIndex: 0, // Unique index for "OG Gamer" badge
        condition: BadgesCondition.Public, // Open for public claiming
        startTime: Math.floor(Date.now() / 1000), // Badge available immediately
        endTime: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Ends in 1 week
      },
    });

    await sendClientTransactions(edgeClient, authorityPublicKey, createUpdateBadgeCriteriaTransaction);
    console.log("OG Gamer badge created successfully!");
  } catch (error) {
    console.error("Error creating OG Gamer badge:", error);
  }
}

export default createOGGamerBadge;
