import base58 from "bs58";
import { VersionedTransaction } from "@solana/web3.js";
import {
  SendTransactionBundlesOptions,
  Transaction,
  Transactions,
} from "@honeycomb-protocol/edge-client";
import {
  EdgeClient,
  SSEOptions,
} from "@honeycomb-protocol/edge-client/client/types";

export const sendClientTransactions = async (
  client: EdgeClient,
  wallet: any,
  txResponse: Transaction | Transactions,
  options?: SendTransactionBundlesOptions & Partial<SSEOptions>
) => {
  if (!wallet.signAllTransactions || !wallet.connected) {
    throw new Error("Invalid wallet");
  }

  // If txResponse contains a single transaction, wrap it as a Transactions object
  if ("transaction" in txResponse) {
    txResponse = {
      blockhash: txResponse.blockhash,
      lastValidBlockHeight: txResponse.lastValidBlockHeight,
      transactions: [txResponse.transaction], // Convert it to an array of transactions
      __typename: "Transactions",
    };
  }

  // Deserialize all transactions from base58 encoding
  const allTxns = txResponse.transactions.map((txStr) => {
    const txn = VersionedTransaction.deserialize(base58.decode(txStr));
    txn.message.recentBlockhash = txResponse.blockhash;
    return txn;
  });

  // Sign all transactions with the wallet
  const signedTxs = await wallet
    .signAllTransactions(allTxns)
    .then((txs) => txs.map((tx) => base58.encode(tx.serialize())))
    .catch((e) => {
      console.error("Failed to sign transactions: ", e);
      throw new Error(e);
    });

  // Send the signed transactions to Honeycomb
  const { sendTransactionBundles } = await client.sendTransactionBundles({
    txs: signedTxs,
    blockhash: txResponse.blockhash,
    lastValidBlockHeight: txResponse.lastValidBlockHeight,
    options,
  });

  return sendTransactionBundles;
};
