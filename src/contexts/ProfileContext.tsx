import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import createEdgeClient from "@honeycomb-protocol/edge-client";
import base58 from "bs58";
import { sendClientTransactions } from "src/utils/sendClientTransactions";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../src/firebase";

const edgeClient = createEdgeClient("https://edge.test.honeycombprotocol.com", true);
const ProfileContext = createContext<any>(null);
export const useProfile = () => useContext(ProfileContext);

interface ProfileProviderProps {
  children: ReactNode;
  projectAddress: string;
}

export const ProfileProvider = ({ children, projectAddress }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("honeycombAccessToken"));
  const [error, setError] = useState<string | null>(null);
  const wallet = useWallet();

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

  const authenticateWithHoneycomb = useCallback(async (retry = false): Promise<string | null> => {
    if (!wallet.publicKey || !wallet.signMessage) return null;
    try {
      console.log("🔑 Authenticating with Honeycomb...");
      const { authRequest: { message } } = await edgeClient.authRequest({
        wallet: wallet.publicKey.toString(),
      });
  
      const signedMessage = await wallet.signMessage(new TextEncoder().encode(message));
      const signature = base58.encode(signedMessage);
  
      const { authConfirm: { accessToken } } = await edgeClient.authConfirm({
        wallet: wallet.publicKey.toString(),
        signature,
      });
  
      const expiry = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
      localStorage.setItem("honeycombAccessToken", accessToken);
      localStorage.setItem("tokenExpiry", expiry.toString());
      setAccessToken(accessToken);
  
      console.log("✅ Authentication successful.");
      return accessToken;
    } catch (error) {
      console.error("🚨 Authentication failed:", error);
      if (!retry) {
        console.warn("🔁 Retrying authentication...");
        return authenticateWithHoneycomb(true); // Retry once
      }
      clearToken();
      return null;
    }
  }, [wallet.publicKey, wallet.signMessage]);
  

  const fetchProfile = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) return;

    try {
      setLoadingProfile(true);
      if (!isTokenValid()) await authenticateWithHoneycomb();

      const { user } = await edgeClient.findUsers({ wallets: [wallet.publicKey.toString()] });
      const userId = user?.[0]?.id;

      if (userId) {
        const { profile: profiles } = await edgeClient.findProfiles({
          userIds: [userId],
          projects: [projectAddress],
          includeProof: true, // 👈 This is critical
        });

        if (profiles?.length > 0) {
          setProfile(profiles[0]);
          console.log("📄 Profile found:", profiles[0]);
        } else {
          console.warn("⚠️ No profile found.");
          setProfile(null);
        }
      } else {
        console.warn("⚠️ No user found for wallet.");
        setProfile(null);
      }
    } catch (error) {
      console.error("🚨 Error fetching profile:", error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [wallet.connected, wallet.publicKey, projectAddress, authenticateWithHoneycomb]);

  const submitScore = async (score: number) => {
    if (!profile || !wallet.publicKey) return console.warn("⚠️ No profile or wallet connected.");

    try {
      await fetchProfile(); // ✅ Ensure latest profile state

      const token = await authenticateWithHoneycomb();
      if (!token) throw new Error("⚠️ Access token unavailable.");

      const currentTopScore = parseInt(profile.customData?.topScore?.[0] || "0", 10);
      const currentAllTimeScore = parseInt(profile.customData?.allTimeScore?.[0] || "0", 10);
      const newTopScore = Math.max(score, currentTopScore);
      const newAllTimeScore = currentAllTimeScore + score;

      const { createUpdateProfileTransaction } = await edgeClient.createUpdateProfileTransaction(
        {
          payer: wallet.publicKey.toString(),
          profile: profile.address,
          info: profile.info,
          customData: {
            add: {
              topScore: [newTopScore.toString()],
              allTimeScore: [newAllTimeScore.toString()],
            },
          },
        },
        { fetchOptions: { headers: { authorization: `Bearer ${token}` } } }
      );

      await sendClientTransactions(edgeClient, wallet, createUpdateProfileTransaction);
      console.log("🎉 Score successfully updated!");

      await fetchProfile(); // ✅ Fetch updated profile after update
    } catch (error) {
      console.error("🚨 Error updating score:", error);
    }
  };

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) fetchProfile();
  }, [wallet.connected, wallet.publicKey, projectAddress]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loadingProfile,
        error,
        accessToken,
        authenticateWithHoneycomb,
        refetchProfile: fetchProfile,
        updateProfile: async (info: { name?: string; bio?: string; pfp?: string }) => {
          if (!wallet.publicKey || !accessToken || !profile?.address) return false;

          try {
            const { createUpdateProfileTransaction } = await edgeClient.createUpdateProfileTransaction(
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
          } catch (error) {
            console.error("🚨 Error updating profile info:", error);
            return false;
          }
        },
        submitScore,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
