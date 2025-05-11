// import React, { useState } from "react";
// import Image from "next/image";
// import { UnityGame } from "../../../src/utils/UnityGame"; // Your UnityGame component
// import { TurboGame } from "../../../src/services/turbogame"; // TurboGame component
// import { useScore } from "../../../src/contexts/ScoreContext"; // Use ScoreContext

// export const Desktop = () => {
//   const [activeGame, setActiveGame] = useState<string | null>(null);
//   const { score } = useScore(); // Fetch the current score from context

//   const handleFullscreen = (canvasId: string) => {
//     const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
//     if (canvas.requestFullscreen) {
//       canvas.requestFullscreen();
//     } else if ((canvas as any).mozRequestFullScreen) {
//       (canvas as any).mozRequestFullScreen();
//     } else if ((canvas as any).webkitRequestFullscreen) {
//       (canvas as any).webkitRequestFullscreen();
//     } else if ((canvas as any).msRequestFullscreen) {
//       (canvas as any).msRequestFullscreen();
//     }
//   };

//   const renderGameSection = (
//     gameId: string,
//     loaderUrl: string,
//     dataUrl: string,
//     frameworkUrl: string,
//     codeUrl: string,
//     canvasId: string,
//     backgroundImageUrl: string
//   ) => (
//     <div className="relative w-[1440px] h-[700px] mb-8">
//       <Image
//         className="w-full h-full object-cover"
//         src={backgroundImageUrl}
//         alt={`Background for ${gameId}`}
//         width={1440}
//         height={700}
//       />
//       <div className="absolute inset-0 flex justify-center items-center">
//         <div className="w-[800px] h-[400px] bg-black bg-opacity-0 flex justify-center items-center">
//           <UnityGame
//             gameId={gameId}
//             loaderUrl={loaderUrl}
//             dataUrl={dataUrl}
//             frameworkUrl={frameworkUrl}
//             codeUrl={codeUrl}
//             canvasId={canvasId}
//             activeGame={activeGame}
//             setActiveGame={setActiveGame}
//             onReload={() => console.log(`${gameId} reloaded`)}
//           />
//         </div>
//       </div>
//     </div>
//   );


//   return (
//     <div className="relative bg-white flex justify-center w-full">
//       {/* Left Ad Section */}
//       <div className="w-[12.5%] flex justify-center bg-gray-900 z-10">
//         <div className="ad-banner">
//           <Image
//             src="/path-to-left-ad-banner.jpg"
//             alt="Left Ad"
//             width={150}
//             height={600}
//           />
//         </div>
//       </div>

//       {/* Main Content Section */}
//       <div className="w-[75%] flex flex-col items-center z-0">
//         <h1 className="text-white text-2xl mb-4">Current Score: {score}</h1> {/* Display the score */}
//         {renderGameSection(
//           "GameOne",
//           "/Games/GameOne/Build/WEBGL.loader.js",
//           "/Games/GameOne/Build/WEBGL.data",
//           "/Games/GameOne/Build/WEBGL.framework.js",
//           "/Games/GameOne/Build/WEBGL.wasm",
//           "gameCanvas1",
//           "/boss.jpg"
//         )}
//         {renderGameSection(
//           "GameTwo",
//           "/Games/GameTwo/Build/PinguTestWEBGL.loader.js",
//           "/Games/GameTwo/Build/PinguTestWEBGL.data",
//           "/Games/GameTwo/Build/PinguTestWEBGL.framework.js",
//           "/Games/GameTwo/Build/PinguTestWEBGL.wasm",
//           "gameCanvas2",
//           "/boss.jpg"
//         )}
//         {renderGameSection(
//           "GameThree",
//           "/Games/GameThree/Build/bcwebgl.loader.js",
//           "/Games/GameThree/Build/bcwebgl.data",
//           "/Games/GameThree/Build/bcwebgl.framework.js",
//           "/Games/GameThree/Build/bcwebgl.wasm",
//           "gameCanvas3",
//           "/boss.jpg"
//         )}
//         {renderGameSection(
//           "GameFive",
//           "/Games/Phantom/Build/.loader.js",
//           "/Games/Phantom/Build/Phantom.data",
//           "/Games/Phantom/Build/Phantom.framework.js",
//           "/Games/Phantom/Build/Phantom.wasm",
//           "gameCanvas5",
//           "/boss.jpg"
//         )}
//         {renderGameSection(
//           "GameSix",
//           "/Games/GameSix/Build/WEBGL.loader.js",
//           "/Games/GameSix/Build/WEBGL.data",
//           "/Games/GameSix/Build/WEBGL.framework.js",
//           "/Games/GameSix/Build/WEBGL.wasm",
//           "gameCanvas6",
//           "/boss.jpg"
//         )}
//         {renderGameSection(
//           "GameSeven",
//           "/Games/GameSeven/Build/WEBGL.loader.js",
//           "/Games/GameSeven/Build/WEBGL.data",
//           "/Games/GameSeven/Build/WEBGL.framework.js",
//           "/Games/GameSeven/Build/WEBGL.wasm",
//           "gameCanvas7",
//           "/boss.jpg"
//         )}
//       </div>

//       {/* Right Ad Section */}
//       <div className="w-[12.5%] flex justify-center bg-gray-900 z-10">
//         <div className="ad-banner">
//           <Image
//             src="/path-to-right-ad-banner.jpg"
//             alt="Right Ad"
//             width={150}
//             height={600}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };
