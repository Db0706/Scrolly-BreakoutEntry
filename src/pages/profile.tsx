// components/ProfilePage.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Portfolio } from "../components/Portfolio";
import { useProfile } from "../contexts/ProfileContext";
import TwitterEmbed from "../components/TwitterEmbed";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./profile.module.css";
import { sendClientTransactions } from "src/utils/sendClientTransactions";
import { useScore } from "../contexts/ScoreContext";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Honeycomb test-net RPC
export const RPC_URL = "https://rpc.test.honeycombprotocol.com/";
export const honeycombConnection = new Connection(RPC_URL, "confirmed");

export default function ProfilePage() {
  const wallet = useWallet();
  const {
    profile,
    accessToken,
    authenticateWithHoneycomb,
    updateProfile,
    submitScore,
    refetchProfile,
    createUserWithProfile,
    status,
  } = useProfile();
  const { score, resetScore } = useScore();

  const [resourceBalance, setResourceBalance] = useState<number | null>(null);

  const handleGetBalance = useCallback(async () => {
    if (!wallet.publicKey) return;
    const lamports = await honeycombConnection.getBalance(wallet.publicKey);
    setResourceBalance(lamports / LAMPORTS_PER_SOL);
  }, [wallet.publicKey]);

  const handleMintTokens = useCallback(async () => {
    if (!wallet.publicKey) {
      alert("Connect your wallet first!");
      return;
    }
    const txid = await honeycombConnection.requestAirdrop(
      wallet.publicKey,
      3 * LAMPORTS_PER_SOL
    );
    alert(`🎉 Airdropped 3 Gamer Tokens! Tx: ${txid}`);
    await handleGetBalance();
  }, [wallet.publicKey, handleGetBalance]);

  const handleSubmitScore = async () => {
    if (!wallet.publicKey || score <= 0)
      return alert("Please connect and score > 0");
    if (!profile)
      return alert("Please create a profile first.");
    if (!accessToken) await authenticateWithHoneycomb();
    await refetchProfile();
    const ok = await submitScore(score);
    if (ok) {
      await refetchProfile();
      resetScore();
      alert("🎉 Score submitted!");
    } else {
      alert("Score submit failed.");
    }
  };

  const handleUpdate = async () => {
    if (!profile) return;
    if (!accessToken) await authenticateWithHoneycomb();
    const ok = await updateProfile(profile.info);
    if (ok) alert("✅ Profile updated");
    else alert("Update failed");
  };

  const missions = [
    { id: 1, title: "Follow us on X", link: "https://x.com/DDGamingLabs" },
    { id: 2, title: "Follow us on Instagram", link: "https://instagram.com/ddgaminglabs" },
    { id: 3, title: "Follow us on TikTok", link: "https://www.tiktok.com/@ddgaminglabs" },
  ];

  // If no profile yet, just render Portfolio (which opens the create-profile UI)
  if (wallet.connected && !profile) {
    return <Portfolio />;
  }

  // Otherwise show the 3-column dashboard
  return (
    <div className={`${styles.pageContainer} min-h-screen w-screen overflow-y-auto flex flex-col gap-4 p-4`}>

<div className="grid auto-rows-min grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* YOUR existing Portfolio section */}
        <div className={`${styles.card} flex flex-col items-center justify-center`}>
          <Portfolio />
        </div>

        {/* Gamer Tokens */}
        <div className={`${styles.card} ${styles.tokenSection}`}>
          <h2 className={styles.heading}>🎮 Gamer Tokens</h2>
          <p className={styles.text}>
            Earned so far:{" "}
            <strong>{profile?.customData?.allTimeScore?.[0] ?? 0}</strong> tokens
          </p>
          <div className={styles.tokenActionGroup}>
            <button onClick={handleMintTokens} className={styles.actionButton}>
              Mint 3 Tokens
            </button>
            <button onClick={handleGetBalance} className={styles.actionButton}>
              Check Balance
            </button>
          </div>
          {resourceBalance != null && (
            <p className={styles.tokenBalance}>
              Balance: <span className={styles.stat}>{resourceBalance}</span>
            </p>
          )}
        </div>

        {/* Missions */}
        <div className={styles.card}>
          <h2 className={styles.heading}>Active Missions</h2>
          <div className="grid grid-cols-1 gap-4">
            {missions.map((m) => (
              <div
                key={m.id}
                className={styles.missionItem}
                onClick={() => window.open(m.link, "_blank")}
              >
                <h3 className={styles.missionTitle}>{m.title}</h3>
              </div>
            ))}
          </div>
        </div>

     {/* Latest Tweet */}
     <div className={styles.card}>
          <h2 className={styles.heading}>Latest Tweet</h2>
          {/* use TwitterEmbed component here */}
          <TwitterEmbed tweetUrl="https://twitter.com/DDGamingLabs/status/1922398481324318886" />
        </div>
      </div>

      {/* Score / Update Buttons */}
      {/* <div className="flex justify-center gap-4 mt-6">
        <button onClick={handleSubmitScore} className={styles.submitScoreButton}>
          Submit
        </button>
        <button onClick={handleUpdate} className={styles.actionButton}>
          Update Profile
        </button>
      </div> */}
    </div>
  );
}
