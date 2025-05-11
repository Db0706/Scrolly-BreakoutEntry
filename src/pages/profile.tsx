"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Portfolio } from "../components/Portfolio";
import { useProfile } from "../contexts/ProfileContext";
import TwitterEmbed from "../components/TwitterEmbed";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./profile.module.css";
import edgeClient from "src/components/honeycombClient";
import { sendClientTransactions } from "src/utils/sendClientTransactions";
import { useScore } from "../contexts/ScoreContext";

const ProfilePage: React.FC = () => {
  const wallet = useWallet();
  const { profile, accessToken, authenticateWithHoneycomb, updateProfile, submitScore, refetchProfile } = useProfile();
  const { score, resetScore } = useScore();

  const RESOURCE_ADDRESS = "FE9bpXVzdsc3b9u67KLJSqqHc8ukm66RxsRfTfj67dsK";
  const MERKLE_TREE_ADDRESS = "G9aZxbsrGaSED6rDYiCcoqLGy5HbN6WZeFG2Mt4BFVY5";

  const [resourceBalance, setResourceBalance] = useState<number | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newName, setNewName] = useState(profile?.info.name || "");
  const [newBio, setNewBio] = useState(profile?.info.bio || "");
  const [newPfp, setNewPfp] = useState(profile?.info.pfp || "");

  const handleGetBalance = useCallback(async () => {
    if (!wallet.publicKey) return;
    try {
      const { holdings } = await edgeClient.findHoldings({
        holders: [wallet.publicKey.toString()],
        trees: [MERKLE_TREE_ADDRESS],
      });
      setResourceBalance(holdings?.[0] ? Number(holdings[0].balance) : 0);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }, [wallet.publicKey]);

  const handleMintTokens = useCallback(async () => {
    if (!wallet.publicKey || !accessToken) return;
    try {
      const { createMintResourceTransaction: tx } = await edgeClient.createMintResourceTransaction(
        {
          resource: RESOURCE_ADDRESS,
          owner: wallet.publicKey.toString(),
          amount: "3",
          authority: wallet.publicKey.toString(),
        },
        {
          fetchOptions: { headers: { authorization: `Bearer ${accessToken}` } },
        }
      );
      await sendClientTransactions(edgeClient, wallet, tx);
      await handleGetBalance();
    } catch (error) {
      console.error("Failed to mint Gamer Tokens:", error);
    }
  }, [wallet.publicKey, accessToken, handleGetBalance]);

  const handleSubmitScore = async () => {
    if (!wallet.publicKey || score <= 0) return alert("Please connect your wallet and ensure score > 0");
    if (!profile) return alert("Please create a profile before submitting a score.");

    try {
      if (!accessToken) await authenticateWithHoneycomb();
      await refetchProfile();         
      const result = await submitScore(score);
      if (result) {
        await refetchProfile();
        resetScore();
        alert("🎉 Score submitted successfully!");
      } else {
        throw new Error("Score submission failed.");
      }
    } catch (error) {
      console.error("Submit score failed:", error);
      alert("🚨 Error submitting score. Please try again.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return alert("Please create a profile before updating.");

    try {
      if (!accessToken) await authenticateWithHoneycomb();
      const success = await updateProfile({ name: newName, bio: newBio, pfp: newPfp });
      if (success) {
        alert("✅ Profile updated successfully!");
        setIsUpdateModalOpen(false);
      } else {
        throw new Error("Profile update failed.");
      }
    } catch (error) {
      console.error("Update profile failed:", error);
      alert("🚨 Failed to update profile. Please try again.");
    }
  };

  const missions = [
    { id: 1, title: "Follow us on X", link: "https://x.com/DDGamingLabs" },
    { id: 2, title: "Follow us on Instagram", link: "https://instagram.com/ddgaminglabs" },
    { id: 3, title: "Follow us on TikTok", link: "https://www.tiktok.com/@ddgaminglabs" },
  ];

  return (
    <div className={`${styles.pageContainer} min-h-screen w-screen overflow-y-auto flex flex-col gap-4 p-4`}>
      {/* Display this ONLY if no profile is found */}
      {!profile && wallet.connected && (
        <div className="text-center text-white bg-blue-600 p-4 rounded shadow">
          <p>No profile found for this wallet. Please create one to continue.</p>
          {/* You can add a Create Profile button here if you have a modal/component for it */}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className={`${styles.card} flex flex-col items-center justify-center`}>
          <Portfolio />
        </div>

        <div className={`${styles.card} ${styles.tokenSection}`}>
          <h2 className={styles.heading}>🎮 Gamer Tokens</h2>
          <p className={styles.text}>Earn and track your on-chain game currency.</p>
          <div className={styles.tokenActionGroup}>
            <button onClick={handleMintTokens} className={styles.actionButton}>Mint 3 Tokens</button>
            <button onClick={handleGetBalance} className={styles.actionButton}>Check Balance</button>
          </div>
          {resourceBalance !== null && (
            <p className={styles.tokenBalance}>
              Current Balance: <span className={styles.stat}>{resourceBalance}</span>
            </p>
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Active Missions</h2>
          <div className="grid grid-cols-1 gap-4">
            {missions.map((mission) => (
              <div key={mission.id} className={styles.missionItem} onClick={() => window.open(mission.link, "_blank")}>
                <h3 className={styles.missionTitle}>{mission.title}</h3>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Latest Tweet</h2>
          <TwitterEmbed tweetUrl="https://x.com/DDGamingLabs/status/1915061362922852604" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
