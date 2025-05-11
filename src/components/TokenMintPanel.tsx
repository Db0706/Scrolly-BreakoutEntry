import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProfile } from "../contexts/ProfileContext";
import edgeClient from "../components/honeycombClient";
import { sendClientTransactions } from "../utils/sendClientTransactions";

const RESOURCE_ADDRESS = "FE9bpXVzdsc3b9u67KLJSqqHc8ukm66RxsRfTfj67dsK";

const TokenMintPanel: React.FC = () => {
  const { publicKey } = useWallet();
  const { profile, refetchProfile } = useProfile();

  const [isCooldown, setIsCooldown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");

  // 🧠 Calculate and show cooldown in Xh Ym
  useEffect(() => {
    if (!profile) return;
    const lastMint = parseInt(profile.customData?.lastFreeMint?.[0] || "0", 10);
    const now = Date.now();
    const msRemaining = 24 * 60 * 60 * 1000 - (now - lastMint);

    if (msRemaining > 0) {
      setIsCooldown(true);
      const hours = Math.floor(msRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
      setCooldownMessage(`Mint available in ${hours}h ${minutes}m`);
    } else {
      setIsCooldown(false);
    }
  }, [profile]);

  const handleFreeMint = async () => {
    if (!publicKey || !profile) return;
    setLoading(true);
    try {
      const { createMintResourceTransaction: tx } =
        await edgeClient.createMintResourceTransaction({
          resource: RESOURCE_ADDRESS,
          authority: publicKey.toBase58(),
          owner: publicKey.toBase58(),
          amount: "3",
        });

      await sendClientTransactions(edgeClient, { publicKey }, tx);

      await edgeClient.createUpdateProfileTransaction({
        profile: profile.address,
        payer: publicKey.toBase58(),
        customData: {
          add: {
            lastFreeMint: [Date.now().toString()],
          },
        },
      });

      alert("✅ 3 Tokens Minted!");
      refetchProfile();
    } catch (err) {
      console.error("Mint error:", err);
      alert("Something went wrong.");
    }
    setLoading(false);
  };

  const handleFakePaidMint = async () => {
    if (!publicKey || !profile) return;
    setModalOpen(true);
    setTimeout(async () => {
      setModalOpen(false);
      setLoading(true);
      try {
        const { createMintResourceTransaction: tx } =
          await edgeClient.createMintResourceTransaction({
            resource: RESOURCE_ADDRESS,
            authority: publicKey.toBase58(),
            owner: publicKey.toBase58(),
            amount: "3",
          });

        await sendClientTransactions(edgeClient, { publicKey }, tx);
        alert("✅ 3 Tokens Purchased & Minted!");
        refetchProfile();
      } catch (err) {
        console.error("Mint error:", err);
        alert("Something went wrong.");
      }
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="text-white p-6 bg-[#1f1f3d] rounded-lg shadow-lg space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">🎮 Mint Gamer Tokens</h2>

      <button
        disabled={isCooldown || loading}
        onClick={handleFreeMint}
        className={`w-full py-2 rounded ${
          isCooldown ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isCooldown ? cooldownMessage : "Mint 3 Free Tokens"}
      </button>

      <div className="text-center text-sm text-gray-400">or</div>

      <button
        disabled={loading}
        onClick={handleFakePaidMint}
        className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700"
      >
        Buy with Apple/Google Pay (Simulated)
      </button>

      <button
        disabled={loading}
        onClick={() => alert("🚧 Solana Pay checkout coming soon!")}
        className="w-full py-2 rounded bg-purple-600 hover:bg-purple-700"
      >
        Buy with Solana Pay
      </button>

      <button
        disabled={loading}
        onClick={() => alert("🚧 Stripe payment coming soon!")}
        className="w-full py-2 rounded bg-pink-600 hover:bg-pink-700"
      >
        Buy with Stripe
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1e1e2e] p-6 rounded shadow-lg text-center">
            <p className="text-lg">🔐 Processing Apple/Google Pay...</p>
            <p className="text-sm text-gray-400 mt-2">Simulated checkout — tokens will mint in a moment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenMintPanel;
