"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Menu } from "@headlessui/react";
import { Menu as MenuIcon } from "lucide-react";
import { useAutoConnect } from "../contexts/AutoConnectProvider";
import { useProfile } from "../contexts/ProfileContext";
import { ScoreContext } from "../contexts/ScoreContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import React from "react";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const AppBar: FC = () => {
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const { score, setScore } = React.useContext(ScoreContext);
  const { authenticateWithHoneycomb, profile, accessToken } = useProfile();
  const { publicKey } = useWallet();
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);

  // ✅ Only attempt Honeycomb auth if on profile page, wallet connected, 
  // ✅ and user already has a profile but no valid token yet
  useEffect(() => {
    if (pathname === "/profile" && publicKey && profile && !accessToken) {
      authenticateWithHoneycomb();
    }
  }, [pathname, publicKey, profile, accessToken, authenticateWithHoneycomb]);

  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      if (typeof event.data === "object" && event.data?.score !== undefined) {
        setScore((prev) => prev + 1);
      }
    };

    window.updateScoreInUI = () => setScore((prev) => prev + 1);

    window.addEventListener("message", handlePostMessage);
    return () => window.removeEventListener("message", handlePostMessage);
  }, [setScore]);

  return (
    <div className="w-full bg-black text-white relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 relative">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center space-x-2">
          <Menu as="div" className="relative inline-block text-left z-50">
            <Menu.Button className="focus:outline-none">
              <MenuIcon className="h-6 w-6 text-white" />
            </Menu.Button>
            <Menu.Items className="absolute mt-2 w-40 bg-[#111] border border-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/feed"
                      className={`block px-4 py-2 text-sm text-white ${active ? "bg-gray-700" : ""}`}
                      onClick={() => setIsNavOpen(false)}
                    >
                      Games
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/lobby"
                      className={`block px-4 py-2 text-sm text-white ${active ? "bg-gray-700" : ""}`}
                      onClick={() => setIsNavOpen(false)}
                    >
                      Leaderboard
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/profile"
                      className={`block px-4 py-2 text-sm text-white ${active ? "bg-gray-700" : ""}`}
                      onClick={() => setIsNavOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>

          <img src="/NewLogo.png" alt="Logo" className="h-20 sm:h-10" />
        </div>

        {/* Score (centered) */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-bold">Score:</span>
            <span className="text-sm font-bold">{score !== null ? score : "Loading..."}</span>
          </div>
        </div>

        {/* Wallet (right) */}
        <div className="transform scale-75 sm:scale-100 origin-right">
          <WalletMultiButtonDynamic />
        </div>
      </div>
    </div>
  );
};

export default AppBar;
