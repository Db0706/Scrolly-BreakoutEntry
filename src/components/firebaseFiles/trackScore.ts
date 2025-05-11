// trackScoreSubmission.ts

import { db } from "./firebaseConfig"; // Ensure this path is correct
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Tracks a user's score submission in Firestore.
 * @param walletAddress - The user's wallet address (used as the document ID).
 * @param score - The score submitted by the user.
 */
export const trackScoreSubmission = async (walletAddress: string, score: number) => {
  try {
    // Reference to the "submissions" sub-collection within the user's document
    const submissionsRef = collection(db, "users", walletAddress, "submissions");

    // Add a new document to the "submissions" sub-collection with the current score and timestamp
    await addDoc(submissionsRef, {
      score: score,
      submissionTime: serverTimestamp(),
    });

    console.log(`Score submission recorded for wallet: ${walletAddress} with score: ${score}`);
  } catch (error) {
    console.error("Error tracking score submission:", error);
  }
};
