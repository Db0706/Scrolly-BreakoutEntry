// import { FC, useEffect, useState } from 'react';
// import { Box, Typography, Container, IconButton } from '@mui/material';
// import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { AutoConnectProvider } from '../../contexts/AutoConnectProvider';
// import { Desktop } from '../../../src/screens/Desktop/';

// export const HomeView: FC = () => {
//   const wallet = useWallet();
//   const { connection } = useConnection();

//   return (
//     <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
//       <WalletProvider wallets={[]}>
//         <AutoConnectProvider>
//           <Desktop />
//         </AutoConnectProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// };

// export default HomeView;
