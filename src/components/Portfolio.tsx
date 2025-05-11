import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { useProfile } from "../contexts/ProfileContext";
import { useScore } from "../contexts/ScoreContext";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import createEdgeClient from "@honeycomb-protocol/edge-client";
import edgeClient from "./honeycombClient";

const client = createEdgeClient("https://edge.test.honeycombprotocol.com", true);
const PROJECT_ADDRESS = "A1gjvxiXX6sSKB22XLg3En3pY2jM1ENmVNMbQmoVXMmw";

const Button = ({ children, className, ...props }) => (
  <button
    className={`px-4 py-2 rounded text-white transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-white">X</button>
        {children}
      </div>
    </div>
  );
};

export const Portfolio = () => {
  const { profile, loadingProfile, refetchProfile, submitScore, authenticateWithHoneycomb } = useProfile();
  const { score, resetScore } = useScore();
  const wallet = useWallet();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileBio, setNewProfileBio] = useState("");
  const [newProfilePfp, setNewProfilePfp] = useState("/default-pfp.png");
  const [newTwitter, setNewTwitter] = useState("");
  const [newDiscord, setNewDiscord] = useState("");

  useEffect(() => {
    if (profile) {
      setNewProfileName(profile.info?.name || "");
      setNewProfileBio(profile.info?.bio || "");
      setNewProfilePfp(profile.info?.pfp || "/default-pfp.png");
      setNewTwitter(profile.customData?.twitter?.[0] || "");
      setNewDiscord(profile.customData?.discord?.[0] || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!loadingProfile && !profile) setShowCreateModal(true);
  }, [loadingProfile, profile]);

  const handleCheckAndCreateUserWithProfile = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }
  
    try {
      const userResult = await client.findUsers({ wallets: [wallet.publicKey.toString()] });
      let user = userResult.user[0];
  
      if (!user) {
        const { createNewUserTransaction: txResponse } = await client.createNewUserTransaction(
          {
            wallet: wallet.publicKey.toString(),
            payer: wallet.publicKey.toString(),
            info: { name: newProfileName, bio: newProfileBio, pfp: newProfilePfp }, // Optional user info
          }
        );
  
        await sendClientTransactions(client, wallet, txResponse);
        console.log("✅ User created successfully.");
  
        const refreshedUser = await client.findUsers({ wallets: [wallet.publicKey.toString()] });
        user = refreshedUser.user[0];
      }
  
      if (!user) throw new Error("Failed to create user.");
  
      const token = await authenticateWithHoneycomb();
      if (!token) throw new Error("Failed to authenticate.");
  
      const profileResult = await client.findProfiles({ userIds: [user.id], projects: [PROJECT_ADDRESS] });
      const foundProfile = profileResult.profile[0];
  
      if (!foundProfile) {
        const { createNewProfileTransaction: txResponse } = await client.createNewProfileTransaction(
          {
            project: PROJECT_ADDRESS,
            info: { name: newProfileName, bio: newProfileBio, pfp: newProfilePfp },
            payer: wallet.publicKey.toString(),
          },
          { fetchOptions: { headers: { authorization: `Bearer ${token}` } } }
        );
  
        await sendClientTransactions(client, wallet, txResponse);
        console.log("✅ Profile created successfully.");
      } else {
        console.log("Profile already exists.");
      }
  
      refetchProfile();
      setShowCreateModal(false);
      alert("🎉 User and profile setup complete!");
    } catch (error) {
      console.error("🚨 Error creating user/profile:", error);
      alert("Error occurred. Please try again.");
    }
  };
  
  
  // const handleCheckAndCreateUserWithProfile = async () => {
  //   if (!wallet.connected || !wallet.publicKey) {
  //     alert("Please connect your wallet.");
  //     return;
  //   }

  //   try {
  //     const token = await authenticateWithHoneycomb();
  //     if (!token) throw new Error("Failed to authenticate.");

  //     const user = await client
  //       .findUsers({ wallets: [wallet.publicKey.toString()] })
  //       .then(({ user }) => user[0]);

  //     if (!user) {
  //       const { createNewUserWithProfileTransaction: txResponse } = await client.createNewUserWithProfileTransaction(
  //         {
  //           userInfo: { name: newProfileName, bio: newProfileBio, pfp: newProfilePfp },
  //           payer: wallet.publicKey.toString(),
  //           wallet: wallet.publicKey.toString(),
  //           project: PROJECT_ADDRESS,
  //         },
  //         { fetchOptions: { headers: { authorization: `Bearer ${token}` } } }
  //       );

  //       const result = await sendClientTransactions(client, wallet, txResponse);
  //       if (result[0]?.responses?.[0]?.error) throw new Error(result[0].responses[0].status);
  //     }

  //     const foundProfile = await client
  //       .findProfiles({ userIds: [user.id], projects: [PROJECT_ADDRESS] })
  //       .then(({ profile }) => profile[0]);

  //     if (!foundProfile) {
  //       const { createNewProfileTransaction: txResponse } = await client.createNewProfileTransaction(
  //         {
  //           project: PROJECT_ADDRESS,
  //           info: { name: newProfileName, bio: newProfileBio, pfp: newProfilePfp },
  //           payer: wallet.publicKey.toString(),
  //         },
  //         { fetchOptions: { headers: { authorization: `Bearer ${token}` } } }
  //       );

  //       const result = await sendClientTransactions(client, wallet, txResponse);
  //       if (result[0]?.responses?.[0]?.error) throw new Error(result[0].responses[0].status);
  //     }

  //     refetchProfile();
  //     setShowCreateModal(false);
  //     alert("User and profile verified or created successfully!");
  //   } catch (error) {
  //     console.error("Error checking or creating user and profile:", error);
  //     alert("An error occurred. Please try again.");
  //   }
  // };

  const handleScoreSubmit = async () => {
    if (!profile || !wallet.publicKey) {
      console.warn("No profile or wallet connected.");
      return;
    }

    try {
      const token = await authenticateWithHoneycomb();
      if (!token) throw new Error("Failed to authenticate.");
      await submitScore(score);
      alert("Score updated successfully!");
      resetScore();
      refetchProfile();
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Failed to update score. Please try again.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile || !wallet.publicKey) {
      console.warn("No profile or wallet connected.");
      return;
    }

    try {
      const token = await authenticateWithHoneycomb();
      if (!token) throw new Error("Failed to authenticate.");

      const { createUpdateProfileTransaction: txResponse } = await client.createUpdateProfileTransaction(
        {
          profile: profile.address,
          payer: wallet.publicKey.toString(),
          info: { name: newProfileName, bio: newProfileBio, pfp: newProfilePfp },
          customData: {
            add: { twitter: [newTwitter], discord: [newDiscord] },
          },
        },
        { fetchOptions: { headers: { authorization: `Bearer ${token}` } } }
      );

      const result = await sendClientTransactions(client, wallet, txResponse);
      if (result[0]?.responses?.[0]?.error) throw new Error(result[0].responses[0].status);

      alert("Profile updated successfully!");
      setShowUpdateModal(false);
      refetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-start pt-16 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {loadingProfile ? (
        <div className="flex items-center justify-center h-96 text-white">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {profile ? (
            <div className="flex flex-col items-center bg-gray-800 p-8 rounded-lg shadow-lg text-white w-full md:col-span-2 mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-center">Welcome, {profile.info?.name || "Gamer"}!</h2>
              <div className="w-40 h-40 relative">
                <Image
                  src={profile.info?.pfp || "/default-pfp.png"}
                  alt={`${profile.info?.name || "User"}'s Profile Picture`}
                  className="rounded-full object-cover"
                  layout="fill"
                />
              </div>
              <p className="text-gray-400 italic text-center">{profile.info?.bio || "No bio available."}</p>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Game Stats:</h3>
                <p>🏆 Top Score: <span className="font-bold">{profile.customData?.topScore?.[0] || "0"}</span></p>
                <p>🔢 All-Time Score: <span className="font-bold">{profile.customData?.allTimeScore?.[0] || "0"}</span></p>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowUpdateModal(true)}>
                  Update Profile
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleScoreSubmit}>
                  Submit Score
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-white">No profile found. Please create one.</p>
          )}

          {/* Profile Creation Modal */}
          <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
            <h2 className="text-xl font-semibold mb-4">Create Your Profile</h2>
            {/* Form Fields */}
            {renderProfileFormFields()}
            <div className="flex gap-4">
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleCheckAndCreateUserWithProfile}>
                Create Profile
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </Modal>

          {/* Profile Update Modal */}
          <Modal open={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
            <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
            {/* Form Fields */}
            {renderProfileFormFields()}
            <div className="flex gap-4">
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpdateProfile}>
                Save Changes
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );

  function renderProfileFormFields() {
    return (
      <>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name:</label>
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Bio:</label>
          <textarea
            value={newProfileBio}
            onChange={(e) => setNewProfileBio(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Profile Picture URL:</label>
          <input
            type="text"
            value={newProfilePfp}
            onChange={(e) => setNewProfilePfp(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Twitter:</label>
          <input
            type="text"
            value={newTwitter}
            onChange={(e) => setNewTwitter(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Discord:</label>
          <input
            type="text"
            value={newDiscord}
            onChange={(e) => setNewDiscord(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          />
        </div>
      </>
    );
  }
};
