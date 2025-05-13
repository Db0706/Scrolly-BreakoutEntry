import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import createEdgeClient from "@honeycomb-protocol/edge-client";
import base58 from "bs58";
import { sendClientTransactions } from "src/utils/sendClientTransactions";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../src/firebase";

const edgeClient = createEdgeClient(
  "https://edge.test.honeycombprotocol.com",
  true
);

const ProfileContext = createContext<any>(null);
export const useProfile = () => useContext(ProfileContext);

interface ProfileProviderProps {
  children: ReactNode;
  projectAddress: string;
}

export const ProfileProvider = ({
  children,
  projectAddress,
}: ProfileProviderProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("honeycombAccessToken")
  );
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(""); // Status for SOL minting & creation
  const wallet = useWallet();

  // Helper to check stored token validity
  const isTokenValid = (): boolean => {
    const token = localStorage.getItem("honeycombAccessToken");
    const expiry = localStorage.getItem("tokenExpiry");
    return !!token && !!expiry && Date.now() < parseInt(expiry, 10);
  };

  const clearToken = () => {
    localStorage.removeItem("honeycombAccessToken");
    localStorage.removeItem("tokenExpiry");
    setAccessToken(null);
  };

  // Auth flow (unchanged)
  const authenticateWithHoneycomb = useCallback(
    async (retry = false): Promise<string | null> => {
      if (!wallet.publicKey || !wallet.signMessage) return null;
      try {
        console.log("🔑 Authenticating with Honeycomb...");
        const {
          authRequest: { message },
        } = await edgeClient.authRequest({
          wallet: wallet.publicKey.toString(),
        });
        const signedMessage = await wallet.signMessage(
          new TextEncoder().encode(message)
        );
        const signature = base58.encode(signedMessage);
        const {
          authConfirm: { accessToken },
        } = await edgeClient.authConfirm({
          wallet: wallet.publicKey.toString(),
          signature,
        });
        const expiry = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
        localStorage.setItem("honeycombAccessToken", accessToken);
        localStorage.setItem("tokenExpiry", expiry.toString());
        setAccessToken(accessToken);
        console.log("✅ Authentication successful.");
        return accessToken;
      } catch (err) {
        console.error("🚨 Authentication failed:", err);
        if (!retry) {
          console.warn("🔁 Retrying authentication...");
          return authenticateWithHoneycomb(true);
        }
        clearToken();
        return null;
      }
    },
    [wallet.publicKey, wallet.signMessage]
  );

  // Fetch existing user/profile (slightly refactored to avoid redundant auth)
  const fetchProfile = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    setLoadingProfile(true);
    try {
      //if (!isTokenValid()) {
       // await authenticateWithHoneycomb();
      //}
      const { user } = await edgeClient.findUsers({
        wallets: [wallet.publicKey.toString()],
      });
      const userId = user?.[0]?.id;
      if (!userId) {
        console.warn("⚠️ No user found for wallet.");
        setProfile(null);
        return;
      }
      const { profile: profiles } = await edgeClient.findProfiles({
        userIds: [userId],
        projects: [projectAddress],
        includeProof: true,
      });
      if (profiles?.length > 0) {
        setProfile(profiles[0]);
        console.log("📄 Profile found:", profiles[0]);
      } else {
        console.warn("⚠️ No profile found.");
        setProfile(null);
      }
    } catch (err) {
      console.error("🚨 Error fetching profile:", err);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [wallet.connected, wallet.publicKey, projectAddress, authenticateWithHoneycomb]);

  // 1) Mint test SOL
  const handleMintTestSOL = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }
    setStatus("Minting 1000 SOL into your wallet...");
    try {
      const response = await fetch("https://rpc.test.honeycombprotocol.com/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "requestAirdrop",
          params: [wallet.publicKey.toString(), 1000 * 1e9],
          id: 1,
          jsonrpc: "2.0",
        }),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error.message);
      setStatus(
        `Airdrop successful! TX ID: ${result.result}.`
      );
    } catch (err: any) {
      console.error("Error minting test SOL:", err);
      setStatus(`Error minting test SOL: ${err.message}`);
    }
  }, [wallet.connected, wallet.publicKey]);

  // 2) Create user + profile
  const createUserWithProfile = useCallback(
    async (userInfo: { name: string; bio: string; pfp: string }) => {
      if (!wallet.connected || !wallet.publicKey) {
        alert("Please connect your wallet.");
        return;
      }
      try {
        // Airdrop first
        await handleMintTestSOL();

        // Authenticate
        const token = await authenticateWithHoneycomb();
        setStatus("Creating on-chain user + profile...");

        // Build tx
        const { createNewUserWithProfileTransaction: tx } =
          await edgeClient.createNewUserWithProfileTransaction(
            {
              project: projectAddress,
              wallet: wallet.publicKey.toString(),
              payer: wallet.publicKey.toString(),
              profileIdentity: "main",
              userInfo,
            },
            { fetchOptions: { headers: { authorization: `Bearer ${token}` } } }
          );

        // Send
        await sendClientTransactions(edgeClient, wallet, tx);
        console.log("🎉 User and profile created!");
        setStatus("User + profile successfully created!");

        // Refresh
        await fetchProfile();
      } catch (err) {
        console.error("🚨 Error creating user and profile:", err);
        setStatus(`Creation failed: ${(err as Error).message}`);
      }
    },
    [wallet.connected, wallet.publicKey, projectAddress, handleMintTestSOL, authenticateWithHoneycomb, fetchProfile]
  );

  // Submit score (unchanged)
  const submitScore = async (score: number) => {
    if (!profile || !wallet.publicKey) {
      console.warn("⚠️ No profile or wallet connected.");
      return;
    }
    try {
      await fetchProfile();
      const token = accessToken || (await authenticateWithHoneycomb());
      if (!token) throw new Error("⚠️ Access token unavailable.");

      const currentTop = parseInt(profile.customData?.topScore?.[0] || "0", 10);
      const currentAll = parseInt(
        profile.customData?.allTimeScore?.[0] || "0",
        10
      );
      const newTop = Math.max(score, currentTop);
      const newAll = currentAll + score;

      const { createUpdateProfileTransaction } =
        await edgeClient.createUpdateProfileTransaction(
          {
            payer: wallet.publicKey.toString(),
            profile: profile.address,
            info: profile.info,
            customData: {
              add: {
                topScore: [newTop.toString()],
                allTimeScore: [newAll.toString()],
              },
            },
          },
          { fetchOptions: { headers: { authorization: `Bearer ${token}` } } }
        );
      await sendClientTransactions(edgeClient, wallet, createUpdateProfileTransaction);
      console.log("🎉 Score successfully updated!");
      await fetchProfile();
    } catch (err) {
      console.error("🚨 Error updating score:", err);
    }
  };

  // On mount/refetch
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) fetchProfile();
  }, [wallet.connected, wallet.publicKey, projectAddress, fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loadingProfile,
        error,
        accessToken,
        status,
        authenticateWithHoneycomb,
        refetchProfile: fetchProfile,
        updateProfile: async (info: {
          name?: string;
          bio?: string;
          pfp?: string;
        }) => {
          if (!wallet.publicKey || !accessToken || !profile?.address) return false;
          try {
            const { createUpdateProfileTransaction } =
              await edgeClient.createUpdateProfileTransaction(
                {
                  profile: profile.address,
                  payer: wallet.publicKey.toString(),
                  info,
                },
                { fetchOptions: { headers: { authorization: `Bearer ${accessToken}` } } }
              );
            await sendClientTransactions(edgeClient, wallet, createUpdateProfileTransaction);
            await fetchProfile();
            return true;
          } catch {
            console.error("🚨 Error updating profile info");
            return false;
          }
        },
        submitScore,
        createUserWithProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
