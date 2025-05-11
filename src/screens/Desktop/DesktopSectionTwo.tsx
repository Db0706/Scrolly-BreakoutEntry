// import React, { useState } from "react";
// import { UnityGame } from "../../../src/utils/UnityGame";
// import Image from 'next/image';

// export const DesktopSectionTwo = () => {
//   const [activeGame, setActiveGame] = useState<string | null>(null);

//   const onReload = () => {
//     console.log("Reloading the game...");
//   };

//   return (
//     <div className="relative w-full h-auto flex flex-col items-center">
//       {/* Main container for the content */}
//       <div className="relative w-[1440px] h-auto bg-[#000000] flex flex-col items-center gap-[70px]">
        
//         {/* Game One - Boss */}
//         <Image
//           className="relative w-[1440px] h-[1440px] object-cover"
//           alt="Boss"
//           src="https://c.animaapp.com/cJjjDHpz/img/boss-1.png"
//         />
//         <div className="relative w-[1000px] h-[600px] bg-[#000000b2]">
//           <UnityGame
//             gameId="GameOne"
//             loaderUrl="/path/to/loaderOne.js"
//             dataUrl="/path/to/dataOne"
//             frameworkUrl="/path/to/frameworkOne"
//             codeUrl="/path/to/codeOne"
//             canvasId="unityCanvas1"
//             activeGame={activeGame}
//             setActiveGame={setActiveGame}
//             onReload={onReload}
//           />
//         </div>
//         <div className="relative w-[1000px] h-[65px] bg-[#000000]" />
//         <div className="relative w-[150px] h-[37px] [font-family:'Zen_Dots',Helvetica] font-normal text-white text-2xl text-center">
//           0 likes
//         </div>

//         {/* Game Two - Second Image */}
//         <Image
//           className="relative w-[1440px] h-[1440px] object-cover"
//           alt="Dalle"
//           src="https://c.animaapp.com/cJjjDHpz/img/dall-e-2024-10-12-16-08-47---a-pixel-art-background-in-a-dark-fa.png"
//         />
//         <div className="relative w-[1000px] h-[600px] bg-[#000000b2]">
//           <UnityGame
//             gameId="GameTwo"
//             loaderUrl="/path/to/loaderTwo.js"
//             dataUrl="/path/to/dataTwo"
//             frameworkUrl="/path/to/frameworkTwo"
//             codeUrl="/path/to/codeTwo"
//             canvasId="unityCanvas2"
//             activeGame={activeGame}
//             setActiveGame={setActiveGame}
//             onReload={onReload}
//           />
//         </div>
//         <div className="relative w-[1000px] h-[65px] bg-[#000000]" />
//         <div className="relative w-[150px] h-[37px] [font-family:'Zen_Dots',Helvetica] font-normal text-white text-2xl text-center">
//           0 likes
//         </div>
//       </div>
//     </div>
//   );
// };
