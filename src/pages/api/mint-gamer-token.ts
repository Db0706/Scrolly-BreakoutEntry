// pages/api/mint-gamer-token.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Keypair, Connection, clusterApiUrl, Transaction } from "@solana/web3.js";
import createEdgeClient from "@honeycomb-protocol/edge-client";
import authorityKeypairJson from "../../../keypairs/authority-keypair.json";

const ADMIN = Keypair.fromSecretKey(Uint8Array.from(authorityKeypairJson));
const RESOURCE = process.env.GAMER_TOKEN_MINT_ADDRESS!;

const edgeClient = createEdgeClient(
  process.env.NEXT_PUBLIC_HONEYCOMB_API_URL!,
  true
);
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { userPubKey } = req.body;
  if (!userPubKey) {
    return res.status(400).json({ error: "Missing userPubKey" });
  }

  try {
    const { createMintResourceTransaction: txResp } =
      await edgeClient.createMintResourceTransaction({
        resource:  RESOURCE,
        amount:    "3",
        owner:     userPubKey,
        authority: ADMIN.publicKey.toBase58(),  // ← YOUR DEV‐WALLET here
        payer:     ADMIN.publicKey.toBase58(),  // ← same dev‐wallet covers fee
      });

    // Decode, sign (fee-payer), and send:
    const tx = Transaction.from(Buffer.from(txResp.transaction, "base64"));
    tx.sign(ADMIN);
    const raw = tx.serialize();
    const txid = await connection.sendRawTransaction(raw);
    await connection.confirmTransaction(txid, "confirmed");

    return res.status(200).json({ success: true, txid });
  } catch (err: any) {
    console.error("Mint error:", err);
    return res.status(500).json({ error: err.message });
  }
}
