import createEdgeClient, {
    CharacterConfigInput,
    SendTransactionBundlesOptions,
    ServiceDelegationInput,
    Transaction,
    Transactions,
  } from "@honeycomb-protocol/edge-client";
  import {
    EdgeClient,
    SSEOptions,
  } from "@honeycomb-protocol/edge-client/client/types";
  import { WalletContextState } from "@solana/wallet-adapter-react";
  import * as web3 from "@solana/web3.js";
  import base58 from "bs58";
  
  // The client function that will be used to interact with the edge server
  const edgeClient = createEdgeClient(
    "https://edge.test.honeycombprotocol.com",
    true
  );
  
  // The function that will be used to sign and send transactions
  export const sendClientTransactions = async (
    client: EdgeClient,
    wallet: WalletContextState,
    txResponse: Transaction | Transactions,
    options?: SendTransactionBundlesOptions & Partial<SSEOptions>
  ) => {
    if ("transaction" in txResponse) {
      txResponse = {
        blockhash: txResponse.blockhash,
        lastValidBlockHeight: txResponse.lastValidBlockHeight,
        transactions: [txResponse.transaction],
        __typename: "Transactions",
      };
    }
  
    const allTxns = txResponse.transactions.map((txStr) => {
      let tn = web3.VersionedTransaction.deserialize(base58.decode(txStr));
      tn.message.recentBlockhash = txResponse.blockhash;
      return tn;
    });
  
    const txs = await wallet.signAllTransactions!(allTxns)
      .then((txs) => {
        return txs.map((tx) => base58.encode(tx.serialize()));
      })
      .catch((e) => {
        console.error("Failed to sign transactions: ", e);
        throw new Error(e);
      });
  
    const { sendTransactionBundles } = await client.sendTransactionBundles({
      txs,
      blockhash: txResponse.blockhash,
      lastValidBlockHeight: txResponse.lastValidBlockHeight,
      options,
    });
  
    return sendTransactionBundles;
  };
  
  // Create a project implementation
  export const createProject = async (
    name: string,
    wallet: WalletContextState
  ) => {
    try {
      // The following function is from the edge client sdk and it creates a transaction to create a project
      const {
        createCreateProjectTransaction: { tx, project: projectAddress },
      } = await edgeClient.createCreateProjectTransaction({
        name,
        authority: wallet?.publicKey?.toBase58()!,
      });
  
      // The tx returned by any create transaction function can be used in this function
      const res = await sendClientTransactions(edgeClient, wallet, tx);
  
      console.log(res);
  
      // if (res[0].responses[0].error) {
      //   throw new Error(res[0].status);
      // }
  
      return {
        projectAddress,
        status: res[0].responses[0].error
          ? res[0].responses[0].status
          : "Project Created Successfully",
        signature: res[0].responses[0].signature,
      };
    } catch (error: any) {
      console.error("Error creating project:", error);
    }
  };
  
  // Similarly, this is a function to add a delegate authority and it takes the arguments required by the inner edge client sdk function
  export const addDelegateAuthority = async (
    projectAddress: string,
    delegate: string,
    serviceDelegations: ServiceDelegationInput,
    wallet: WalletContextState
  ) => {
    if (!projectAddress || !delegate || !serviceDelegations) {
      throw new Error("Missing required fields");
    }
  
    try {
      const { createCreateDelegateAuthorityTransaction: tx } =
        await edgeClient.createCreateDelegateAuthorityTransaction({
          authority: wallet.publicKey?.toBase58()!,
          delegate,
          project: projectAddress,
          serviceDelegations,
        });
  
      // The transaction returned by the earlier function can be signed and sent through this one
      const res = await sendClientTransactions(edgeClient, wallet, tx);
  
      console.log(res);
  
      // if (res[0].responses[0].error) {
      //   throw new Error(res[0].responses[0].status);
      // }
  
      return "Delegate Authority Added Successfully";
    } catch (error: any) {
      return error.message;
    }
  };
  
  // The same pattern is followed for creating a character model
  export const createCharacterModel = async (
    projectAddress: string,
    characterConfig: CharacterConfigInput,
    wallet: WalletContextState
  ) => {
    if (!projectAddress || !characterConfig) {
      throw new Error("Missing required fields");
    }
  
    try {
      const {
        createCreateCharacterModelTransaction: { characterModel, tx },
      } = await edgeClient.createCreateCharacterModelTransaction({
        authority: wallet.publicKey?.toBase58()!,
        project: projectAddress,
        config: characterConfig,
      });
  
      const res = await sendClientTransactions(edgeClient, wallet, tx);
  
      // if (res[0].error) {
      //   throw new Error(res[0].error);
      // }
  
      return {
        characterModel,
        status: "Character Model Created Successfully",
        signature: res[0].responses[0].signature,
      };
    } catch (error: any) {
      console.error("Error creating character model:", error);
      return error.message;
    }
  };
  
  // And for creating a mission pool
  export const createMissionPool = async (
    name: string,
    projectAddress: string,
    characterModel: string[],
    wallet: WalletContextState
  ) => {
    if (!name || !projectAddress || !characterModel) {
      throw new Error("Missing required fields");
    }
  
    try {
      const {
        createCreateMissionPoolTransaction: { missionPoolAddress, tx },
      } = await edgeClient.createCreateMissionPoolTransaction({
        data: {
          name,
          project: projectAddress,
          authority: wallet.publicKey?.toBase58()!,
          characterModel: characterModel[0],
          payer: wallet.publicKey?.toBase58()!,
        },
      });
  
      const res = await sendClientTransactions(edgeClient, wallet, tx);
  
      if (res[0].responses[0].error) {
        throw new Error(res[0].responses[0].status);
      }
      return {
        missionPoolAddress,
        status: "Mission Pool Created",
        signature: res[0].responses[0].signature,
      };
    } catch (error: any) {
      console.error("Error creating mission pool:", error);
      return error.message;
    }
  };
  