// // Achievements.tsx
// import React, { useState } from 'react';
// import { useWallet } from "@solana/wallet-adapter-react";
// import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
// import { BadgesCondition } from '@honeycomb-protocol/edge-client';
// import createEdgeClient from "@honeycomb-protocol/edge-client";
// import { useProfile } from '../contexts/ProfileContext';
// import styles from './achievements.module.css';

// const edgeClient = createEdgeClient("https://edge.test.honeycombprotocol.com", true);
// const projectAddress = "A1gjvxiXX6sSKB22XLg3En3pY2jM1ENmVNMbQmoVXMmw";

// export const Achievements: React.FC = () => {
//   const wallet = useWallet();
//   const { profile, accessToken, authenticateWithHoneycomb } = useProfile();
//   const [claiming, setClaiming] = useState(false);

//   const claimAchievement = async () => {
//     if (!profile || !wallet.publicKey || !accessToken) return;

//     setClaiming(true);

//     try {
//       // Authenticate if accessToken is missing
//       if (!accessToken) {
//         console.log("No access token found, authenticating...");
//         await authenticateWithHoneycomb();
//       }

//       // Attempt to claim the badge
//       await attemptBadgeClaim();
//     } catch (error) {
//       console.error("Error claiming OG Gamer achievement:", error);
//       alert("Failed to claim OG Gamer achievement.");
//     } finally {
//       setClaiming(false);
//     }
//   };

//   const attemptBadgeClaim = async (retry: boolean = false) => {
//     try {
//       // Detailed logging for debugging
//       console.log("Attempting badge claim with parameters:", {
//         profileAddress: profile.address,
//         projectAddress,
//         proof: BadgesCondition.Public,
//         payer: wallet.publicKey.toString(),
//         criteriaIndex: 0,
//       });

//       const { createClaimBadgeCriteriaTransaction } = await edgeClient.createClaimBadgeCriteriaTransaction({
//         args: {
//           profileAddress: profile.address,
//           projectAddress: projectAddress,
//           proof: BadgesCondition.Public,
//           payer: wallet.publicKey.toString(),
//           criteriaIndex: 0,
//         },
//       });

//       await sendClientTransactions(edgeClient, wallet, createClaimBadgeCriteriaTransaction);
//       alert("OG Gamer achievement claimed successfully!");
//     } catch (error) {
//       console.error("Error during badge claim attempt:", error);

//       // If authorization fails, attempt re-authentication and retry if not already retried
//       if (
//         !retry &&
//         error.message &&
//         (error.message.includes("Unauthorized") || error.message.includes("Invalid token"))
//       ) {
//         console.log("Access token might be invalid. Re-authenticating...");
//         await authenticateWithHoneycomb();

//         // Retry the claim once after re-authenticating
//         await attemptBadgeClaim(true);
//       } else {
//         throw error; // Propagate error if it’s not an authorization issue or retry already happened
//       }
//     }
//   };

//   return (
//     <div className={styles.achievementsContainer}>
//       <h3>Achievements</h3>
//       <ul>
//         <li>OG Gamer</li>
//       </ul>
//       <button onClick={claimAchievement} className={styles.button} disabled={claiming}>
//         {claiming ? "Claiming..." : "Claim OG Gamer"}
//       </button>
//     </div>
//   );
// };

// export default Achievements;
