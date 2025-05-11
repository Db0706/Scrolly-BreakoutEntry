import React from 'react';
import Image from 'next/image';

interface ProfileInfoProps {
  pfp: string;
  username: string;
  name: string;
  bio: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ pfp, username, name, bio }) => {
  return (
    <div className="flex flex-col items-center bg-black/60 p-5 rounded-lg text-white">
      <Image
        src={pfp || '/blank.png'}
        alt="Profile"
        className="w-24 h-24 rounded-full mb-4"
      />
      <h2 className="text-2xl font-bold mb-2">{name}</h2>
      <p className="text-sm text-gray-400 text-center mb-4">{bio}</p>
      <h3 className="text-xl">@{username}</h3>
    </div>
  );
};

export default ProfileInfo;
