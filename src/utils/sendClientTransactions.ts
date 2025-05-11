import base58 from "bs58";
import { VersionedTransaction } from "@solana/web3.js";
import type {
  SendTransactionBundlesOptions,
  Transaction,
  Transactions,
} from "@honeycomb-protocol/edge-client";
import type { EdgeClient, SSEOptions } from "@honeycomb-protocol/edge-client/client/types";

export const sendClientTransactions = async (
  client: EdgeClient,
  wallet: any,
  txResponse: Transaction | Transactions,
  options?: SendTransactionBundlesOptions & Partial<SSEOptions>
) => {
  if (!wallet.signAllTransactions || !wallet.connected) {
    throw new Error("Invalid wallet: Wallet must be connected and support signAllTransactions.");
  }

  try {
    if ("transaction" in txResponse) {
      txResponse = {
        blockhash: txResponse.blockhash,
        lastValidBlockHeight: txResponse.lastValidBlockHeight,
        transactions: [txResponse.transaction],
        __typename: "Transactions",
      };
    }

    console.log("📦 Raw transaction response:", txResponse);

    const allTxns = txResponse.transactions.map((txStr) => {
      const txn = VersionedTransaction.deserialize(base58.decode(txStr));
      txn.message.recentBlockhash = txResponse.blockhash;
      return txn;
    });

    console.log("📄 Deserialized transactions:", allTxns);

    const signedTransactions = await wallet.signAllTransactions(allTxns)
      .then((txs) => txs.map((tx) => base58.encode(tx.serialize())))
      .catch((e) => {
        console.error("❌ Failed to sign transactions:", e);
        throw new Error(`Signing transactions failed: ${e.message || e}`);
      });

    console.log("✍️ Signed transactions (base58):", signedTransactions);

    const { sendTransactionBundles } = await client.sendTransactionBundles({
      txs: signedTransactions,
      blockhash: txResponse.blockhash,
      lastValidBlockHeight: txResponse.lastValidBlockHeight,
      options,
    });

    console.log("📬 Response from sendTransactionBundles:", sendTransactionBundles);

    // ✅ Explicitly check for errors in the response
    const hasFailure = sendTransactionBundles.some((bundle) => 
      bundle.responses.some((res) => res.error || !res.signature)
    );

    if (hasFailure) {
      const errors = sendTransactionBundles.flatMap(bundle => 
        bundle.responses.filter(res => res.error).map(res => res.error)
      );
      console.error("🚨 Transaction failed with errors:", errors);
      throw new Error(`Transaction failed: ${errors.join("; ")}`);
    }

    console.log("✅ Transactions successfully sent and confirmed.");
    return sendTransactionBundles;
  } catch (error) {
    console.error("❗ Error in sendClientTransactions:", error);
    throw error;
  }
};
