import React from 'react';
import { useWallet } from "@solana/wallet-adapter-react";

interface CreateUserProps {
  projectAddress: string;
}

const CreateUser: React.FC<CreateUserProps> = ({ projectAddress }) => {
  const wallet = useWallet();

  // Function to create a user profile (calling the API route)
  const createUserProfile = async () => {
    try {
      const response = await fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectAddress,
          publicKey: wallet.publicKey.toBase58(),
          payer: wallet.publicKey.toBase58(),
          userInfo: {
            username: "YourUsername", // You can replace this with dynamic input
            bio: "YourBio",
            pfp: "ProfilePictureURL",
            name: "YourName",
          },
        }),
      });

      const data = await response.json();
      console.log("User profile created with transaction:", data.transaction);
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  };

  return (
    <div>
      <h1>Create a User Profile</h1>
      <button onClick={createUserProfile}>Create User</button>
    </div>
  );
};

export default CreateUser;
