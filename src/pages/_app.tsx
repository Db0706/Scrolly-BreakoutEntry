// pages/_app.tsx

import { AppProps } from "next/app";
import { FC, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ContextProvider } from "../contexts/ContextProvider";
import { ProfileProvider } from "../contexts/ProfileContext";
import { ScoreProvider } from "../contexts/ScoreContext";
import { AppBar } from "../components/AppBar";
import { ContentContainer } from "../components/ContentContainer";
import { Footer } from "../components/Footer";
import Notifications from "../components/Notification";
import { ScrollFeed } from "../components/ScrollFeed";
import { GatewayProvider } from "@civic/solana-gateway-react";
import { Connection, PublicKey } from "@solana/web3.js";

// Import Moongate Wallet Adapter
import { registerMoonGateWallet } from "@moongate/moongate-adapter";

import "../styles/globals.css";
import { Desktop } from "src/screens/Desktop";
require("@solana/wallet-adapter-react-ui/styles.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  // Network RPC Endpoint
  const endpoint = "https://rpc.test.honeycombprotocol.com"; // Replace with actual Honeycomb endpoint if needed

  // Register Moongate Wallets
  registerMoonGateWallet({
    authMode: "Google",
    position: "top-right",
    logoDataUri: "OPTIONAL_LOGO_URL", // Add your logo here (if needed)
    buttonLogoUri: "OPTIONAL_BUTTON_LOGO_URL", 
  });
  registerMoonGateWallet({
    authMode: "Apple",
    position: "top-right",
    logoDataUri: "OPTIONAL_LOGO_URL",
    buttonLogoUri: "OPTIONAL_BUTTON_LOGO_URL",
  });
  registerMoonGateWallet({
    authMode: "Twitter",
    position: "top-right",
    logoDataUri: "OPTIONAL_LOGO_URL",
    buttonLogoUri: "OPTIONAL_BUTTON_LOGO_URL",
  });
  registerMoonGateWallet({
    authMode: "Ethereum",
    position: "top-left",
    logoDataUri: "OPTIONAL_LOGO_URL",
    buttonLogoUri: "OPTIONAL_BUTTON_LOGO_URL",
  });

  // Wallet Adapters (Phantom and Solflare)
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  // Define the project address
  const projectAddress = "A1gjvxiXX6sSKB22XLg3En3pY2jM1ENmVNMbQmoVXMmw";

  // Civic CAPTCHA Gatekeeper Network Public Key
  const gatekeeperNetwork = useMemo(
    () => new PublicKey("ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6"),
    []
  );

  return (
    <ContextProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <GatewayProvider
              connection={new Connection(endpoint, "confirmed")}
              cluster="devnet-beta"
              wallet={wallets[0]}
              gatekeeperNetwork={gatekeeperNetwork}
              options={{ autoShowModal: true }}
            >
              <ScoreProvider>
                <ProfileProvider projectAddress={projectAddress}>
                  <div className="flex flex-col h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900">
                    <Notifications />
                    <AppBar />

                    <ContentContainer>
                      <ScrollFeed>
                        {[<Component key="page" {...pageProps} />]}
                      </ScrollFeed>
                    </ContentContainer>

                   
                  </div>
                </ProfileProvider>
              </ScoreProvider>
            </GatewayProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ContextProvider>
  );
};

export default App;
