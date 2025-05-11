// services/honeycombResources.ts
import edgeClient from "../components/honeycombClient";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { ResourceStorageEnum } from "@honeycomb-protocol/edge-client"; // Import ResourceStorageEnum

// Function to create the Gamer Tokens resource
export const createGamerTokensResource = async (
  projectAddress: string,
  wallet: WalletContextState,
  accessToken: string
) => {
  const { createCreateNewResourceTransaction: { tx: txResponse, resource: resourceAddress } } = 
    await edgeClient.createCreateNewResourceTransaction(
      {
        project: projectAddress,
        authority: wallet.publicKey!.toBase58(),
        payer: wallet.publicKey!.toBase58(),
        params: {
          name: "Gamer Tokens",
          decimals: 6,
          symbol: "GMR",
          uri: "https://example.com/gamer-tokens",
          storage: ResourceStorageEnum.AccountState, // Use enum instead of a string
        },
      },
      {
        fetchOptions: {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

  await sendClientTransactions(edgeClient, wallet, txResponse);
  return resourceAddress;
};

// Function to mint additional tokens to an existing Gamer Tokens resource
export const mintGamerTokens = async (
  resourceAddress: string,
  wallet: WalletContextState,
  amount: number,
  accessToken: string
) => {
  if (!wallet.publicKey) {
    throw new Error("Wallet is not connected");
  }

  const { createMintResourceTransaction: txResponse } = await edgeClient.createMintResourceTransaction(
    {
      resource: resourceAddress,
      owner: wallet.publicKey.toBase58(), // Owner who will receive the tokens
      authority: wallet.publicKey.toBase58(), // Authority to mint
      amount: amount.toString(), // Amount to mint, as a string
    },
    {
      fetchOptions: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  await sendClientTransactions(edgeClient, wallet, txResponse);
};

// Function to get the balance of a specific resource
export const getResourceBalance = async (
  projectAddress: string,
  resourceMint: string,
  wallet: WalletContextState
) => {
  if (!wallet.publicKey) {
    throw new Error("Wallet is not connected");
  }

  // Query the resources for the specific project and mint
  const { resources } = await edgeClient.findResources({
    addresses: [resourceMint], // Use the mint address of the resource
    projects: [projectAddress],
  });

  const resource = resources[0];
  
  // Check if the `params` contain `decimals`, and handle different cases
  let balance = 0;
  if (resource?.kind.params && resource.kind.params.__typename === "ResourceKindParamsHplFungible") {
    balance = resource.kind.params.decimals;
  } else if (resource?.kind.params && resource.kind.params.__typename === "ResourceKindParamsWrappedFungible") {
    balance = resource.kind.params.decimals;
  } else {
    console.warn("Resource type does not include decimals or is not fungible.");
  }

  return balance;
};
