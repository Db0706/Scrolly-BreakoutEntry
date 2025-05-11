import React, { useEffect, useState, useCallback } from "react";
import createEdgeClient from "@honeycomb-protocol/edge-client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./lobby.module.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProfile } from "../contexts/ProfileContext"; // ✅ pull in active profile

const edgeClient = createEdgeClient("https://edge.test.honeycombprotocol.com", true);
const projectAddress = "A1gjvxiXX6sSKB22XLg3En3pY2jM1ENmVNMbQmoVXMmw";

interface Profile {
  address: string;
  customData: Record<string, any>;
  info: {
    name?: string;
    pfp?: string;
  };
}

interface ProfileWithScore extends Profile {
  topScore: number;
}

const Leaderboard: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const wallet = useWallet();
  const { profile: userProfile } = useProfile(); // ✅ access the current user's profile

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const { profile: fetchedProfiles } = await edgeClient.findProfiles({
        projects: [projectAddress],
      });

      const sortedProfiles = fetchedProfiles
        .map((profile) => {
          const topScore = parseInt(profile.customData?.topScore?.[0] || "0", 10);
          return { ...profile, topScore };
        })
        .sort((a, b) => b.topScore - a.topScore);

      setProfiles(sortedProfiles);
    } catch (error) {
      console.error("Error fetching profiles for leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const getUserRankInfo = () => {
    if (!userProfile?.address) return null;

    const index = profiles.findIndex((p) => p.address === userProfile.address);
    if (index === -1) return null;

    return {
      rank: index + 1,
      profile: profiles[index],
    };
  };

  const handleShareMyRank = () => {
    const userRankInfo = getUserRankInfo();
    if (!userRankInfo) return alert("You are not on the leaderboard yet!");

    const { rank, profile } = userRankInfo;

    const text = `I am ranked #${rank} on the DD Gaming leaderboard with a score of ${profile.topScore}! 🎮 Can you beat me?`;
    const url = "https://ddgaming.com/leaderboard";
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank");
  };

  const userRankInfo = getUserRankInfo();

  if (loading) {
    return <p className="text-gray-400 text-center">Loading leaderboard...</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Leaderboard</h2>

      {/* User Info Section */}
      <div className="mb-6 text-center text-white">
        {userRankInfo ? (
          <>
            <p className="text-lg font-semibold">
              🧍 You are ranked <span className="text-blue-400">#{userRankInfo.rank}</span> — Top Score:{" "}
              <span className="text-green-400">{userRankInfo.profile.topScore}</span>
            </p>
            <button
              onClick={handleShareMyRank}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-md transition-all"
            >
              Share My Rank on X
            </button>
          </>
        ) : (
          <p className="text-md text-gray-300">
            👾 You have not made the leaderboard yet — keep playing!
          </p>
        )}
      </div>

      {/* Leaderboard List */}
      <div className={styles.leaderboard}>
        {profiles.length > 0 ? (
          <AnimatePresence>
            {profiles.slice(0, visibleCount).map((profile, index) => (
              <motion.div
                key={profile.address}
                className={`${styles.leaderboardItem} ${
                  index === 0
                    ? styles.rank1
                    : index === 1
                    ? styles.rank2
                    : index === 2
                    ? styles.rank3
                    : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={styles.rank}>{index + 1}</div>
                <Image
                  src={profile.info.pfp || "/blank.png"}
                  alt={`${profile.info.name || "Anonymous"}&apos;s profile`}
                  className={styles.profileImage}
                  width={50}
                  height={50}
                  priority
                  onError={(e) => {
                    e.currentTarget.src = "/blank.png";
                  }}
                />
                <div className={styles.profileDetails}>
                  <p className={styles.profileName}>
                    {profile.info.name || "Anonymous"}
                  </p>
                  <p className={styles.profileScore}>
                    Top Score: {profile.topScore}
                  </p>
                  {index === 0 && (
                    <span className={styles.badge}>🏆 Top Scorer</span>
                  )}
                </div>
                {index < 3 && (
                  <span className={styles.rankIcon}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <p className="text-gray-400">No profiles found on the leaderboard.</p>
        )}
      </div>

      {visibleCount < profiles.length && (
        <button className={styles.showMoreButton} onClick={handleShowMore}>
          Show More
        </button>
      )}
    </div>
  );
};

export default Leaderboard;
