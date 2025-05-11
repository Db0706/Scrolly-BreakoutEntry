// services/honeycombAuth.ts
import { WalletContextState } from "@solana/wallet-adapter-react";
import base58 from "bs58";
import edgeClient from "../components/honeycombClient";

export const authenticateUser = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) {
    throw new Error("Wallet is not connected");
  }

  // Step 1: Request the auth message from Honeycomb
  const { authRequest: { message: authRequestMessage } } = await edgeClient.authRequest({
    wallet: wallet.publicKey.toBase58() // Pass as part of an object with a 'wallet' key
  });

  // Step 2: User signs the message with their wallet
  const encodedMessage = new TextEncoder().encode(authRequestMessage);
  const signedMessage = await wallet.signMessage(encodedMessage);
  const signature = base58.encode(signedMessage);

  // Step 3: Confirm authentication with the signed message to get access token
  const { authConfirm } = await edgeClient.authConfirm({
    wallet: wallet.publicKey.toBase58(),
    signature,
  });

  return authConfirm.accessToken;
};
