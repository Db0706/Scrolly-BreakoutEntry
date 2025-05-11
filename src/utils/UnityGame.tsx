import { useEffect, useRef, useState } from 'react';
import { useUnityContext } from 'react-unity-webgl';

interface UnityGameProps {
  gameId: string;
  loaderUrl: string;
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  canvasId: string;
  activeGame: string | null;
  setActiveGame: (gameId: string | null) => void;
  onReload: () => void;
}

export const UnityGame = ({
  gameId,
  loaderUrl,
  dataUrl,
  frameworkUrl,
  codeUrl,
  canvasId,
  activeGame,
  setActiveGame,
  onReload,
}: UnityGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [unityInstance, setUnityInstance] = useState<any>(null);

  const { unityProvider, unload } = useUnityContext({
    loaderUrl,
    dataUrl,
    frameworkUrl,
    codeUrl,
  });

  const handleFullscreen = () => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if ((canvas as any).mozRequestFullScreen) { // Firefox
      (canvas as any).mozRequestFullScreen();
    } else if ((canvas as any).webkitRequestFullscreen) { // Chrome, Safari, and Opera
      (canvas as any).webkitRequestFullscreen();
    } else if ((canvas as any).msRequestFullscreen) { // IE/Edge
      (canvas as any).msRequestFullscreen();
    }
  };

  useEffect(() => {
    const loadGame = async () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error(`Canvas element not found for ${gameId}`);
        return;
      }

      const script = document.createElement('script');
      script.src = loaderUrl;
      script.onload = () => {
        if (typeof (window as any).createUnityInstance === 'function') {
          (window as any).createUnityInstance(canvas, { dataUrl, frameworkUrl, codeUrl })
            .then((instance: any) => {
              setUnityInstance(instance);
              console.log(`${gameId} loaded successfully.`);
              instance.SendMessage('GameManager', 'PauseGame');
            })
            .catch((error: any) => {
              console.error(`Failed to load ${gameId}:`, error);
            });
        } else {
          console.error('createUnityInstance function not found.');
        }
      };

      const existingScript = document.querySelector(`script[src="${loaderUrl}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }

      document.head.appendChild(script);
    };

    loadGame();
  }, [loaderUrl, dataUrl, frameworkUrl, codeUrl, gameId]);

  // Function to handle the IntersectionObserver for pausing/resuming games
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      console.log(`${entry.target.id} is intersecting: ${entry.isIntersecting}, intersectionRatio: ${entry.intersectionRatio}`);
      if (entry.isIntersecting && entry.intersectionRatio === 1) {
        if (entry.target.id === canvasId && activeGame !== gameId) {
          console.log(`Resuming ${gameId}`);
          if (unityInstance) {
            unityInstance.SendMessage('GameManager', 'ResumeGame');
          }
          setActiveGame(gameId);
        }
      } else if (entry.intersectionRatio < 0.99) {
        if (entry.target.id === canvasId && activeGame === gameId) {
          console.log(`Pausing ${gameId}`);
          if (unityInstance) {
            unityInstance.SendMessage('GameManager', 'PauseGame');
          }
          setActiveGame(null);
        }
      }
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      threshold: [0, 0.99, 1],
    });

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        observer.unobserve(canvasRef.current);
      }
    };
  }, [activeGame, setActiveGame, canvasId, gameId, unityInstance]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '80vh',
        margin: '0 auto',
        flexDirection: 'column',
      }}
    >
      <canvas
        id={canvasId}
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '800px',
          height: '100%',
          maxHeight: '400px',
          border: '10px solid #ffffff',
        }}
      />
        <div className="flex justify-center gap-4 mt-4">
        <button onClick={onReload} className="bg-black text-white px-4 py-2">
          Reload Game
        </button>
        <button onClick={handleFullscreen} className="bg-black text-white px-4 py-2">
          Fullscreen
        </button>
      </div>
    </div>
  );
};
