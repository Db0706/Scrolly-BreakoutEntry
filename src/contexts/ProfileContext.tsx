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
import { RPC_URL } from "src/pages/profile";

const edgeClient = createEdgeClient(
  "https://edge.test.honeycombprotocol.com",
  true
);

interface ProfileContextValue {
  profile: any;
  loadingProfile: boolean;
  error: string | null;
  status: string;
  accessToken: string | null;
  authenticateWithHoneycomb: () => Promise<string | null>;
  refetchProfile: () => Promise<void>;
  updateProfile: (info: { name?: string; bio?: string; pfp?: string }) => Promise<boolean>;
  submitScore: (score: number) => Promise<boolean>;
  createUserWithProfile: (info: { name: string; bio: string; pfp: string }) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);
export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be inside ProfileProvider");
  return ctx;
};

export const ProfileProvider: React.FC<{ projectAddress: string; children: ReactNode }> = ({
  projectAddress,
  children,
}) => {
  const wallet = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("honeycombAccessToken")
  );
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const authenticateWithHoneycomb = useCallback(async (): Promise<string | null> => {
    if (!wallet.publicKey || !wallet.signMessage) return null;
    const { authRequest } = await edgeClient.authRequest({ wallet: wallet.publicKey.toString() });
    const signed = await wallet.signMessage(new TextEncoder().encode(authRequest.message));
    const signature = base58.encode(signed);
    const { authConfirm } = await edgeClient.authConfirm({
      wallet: wallet.publicKey.toString(),
      signature,
    });
    localStorage.setItem("honeycombAccessToken", authConfirm.accessToken);
    setAccessToken(authConfirm.accessToken);
    return authConfirm.accessToken;
  }, [wallet]);

  const fetchProfile = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    setLoadingProfile(true);
    try {
      const { user } = await edgeClient.findUsers({
        wallets: [wallet.publicKey.toString()],
      });
      const userId = user?.[0]?.id;
      if (!userId) {
        setProfile(null);
        return;
      }
      const { profile: profiles } = await edgeClient.findProfiles({
        userIds: [userId],
        projects: [projectAddress],
        includeProof: true,
      });
      setProfile(profiles[0] ?? null);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [wallet, projectAddress]);

  const handleMintTestSOL = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) return;
    setStatus("Minting 1000 SOL...");
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "requestAirdrop",
        params: [wallet.publicKey.toString(), 1000 * 1e9],
        id: 1,
        jsonrpc: "2.0",
      }),
    }).then((r) => r.json());
    if (res.error) throw new Error(res.error.message);
    setStatus(`Airdrop TX: ${res.result}`);
  }, [wallet]);

  const createUserWithProfile = useCallback(
    async (userInfo: { name: string; bio: string; pfp: string }) => {
      if (!wallet.connected || !wallet.publicKey) {
        alert("Please connect your wallet.");
        return;
      }
      try {
        await handleMintTestSOL();
        const token = await authenticateWithHoneycomb();
        setStatus("Creating user+profile...");
        const { createNewUserWithProfileTransaction } =
          await edgeClient.createNewUserWithProfileTransaction(
            {
              project: projectAddress,
              wallet: wallet.publicKey.toString(),
              payer: wallet.publicKey.toString(),
              profileIdentity: "main",
              userInfo,
            },
            {
              fetchOptions: {
                headers: { authorization: `Bearer ${token}` },
              },
            }
          );
        await sendClientTransactions(edgeClient, wallet, createNewUserWithProfileTransaction);
        await fetchProfile();
        setStatus("");
      } catch (err: any) {
        console.error("Error creating profile:", err);
        setStatus(`Create failed: ${err.message}`);
      }
    },
    [wallet, projectAddress, handleMintTestSOL, authenticateWithHoneycomb, fetchProfile]
  );

  const updateProfile = useCallback(
    async (info: { name?: string; bio?: string; pfp?: string }) => {
      if (!wallet.publicKey || !accessToken || !profile?.address) return false;
      const { createUpdateProfileTransaction } =
        await edgeClient.createUpdateProfileTransaction(
          {
            profile: profile.address,
            payer: wallet.publicKey.toString(),
            info,
          },
          {
            fetchOptions: {
              headers: { authorization: `Bearer ${accessToken}` },
            },
          }
        );
      await sendClientTransactions(edgeClient, wallet, createUpdateProfileTransaction);
      await fetchProfile();
      return true;
    },
    [wallet, accessToken, profile, fetchProfile]
  );

  const submitScore = useCallback(
    async (score: number) => {
      if (!profile || !wallet.publicKey) return false;
      const token = accessToken ?? (await authenticateWithHoneycomb());
      const currentAll = parseInt(profile.customData?.allTimeScore?.[0] ?? "0", 10);
      const newAll = currentAll + score;
      const { createUpdateProfileTransaction } =
        await edgeClient.createUpdateProfileTransaction(
          {
            payer: wallet.publicKey.toString(),
            profile: profile.address,
            info: profile.info,
            customData: { add: { allTimeScore: [newAll.toString()] } },
          },
          {
            fetchOptions: {
              headers: { authorization: `Bearer ${token}` },
            },
          }
        );
      await sendClientTransactions(edgeClient, wallet, createUpdateProfileTransaction);
      await fetchProfile();
      return true;
    },
    [wallet, profile, accessToken, authenticateWithHoneycomb, fetchProfile]
  );

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchProfile();
    }
  }, [wallet, fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loadingProfile,
        error,
        status,
        accessToken,
        authenticateWithHoneycomb,
        refetchProfile: fetchProfile,
        updateProfile,
        submitScore,
        createUserWithProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
