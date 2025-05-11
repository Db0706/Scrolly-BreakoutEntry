// Declare global variables for the window object
export {};

declare global {
  interface Window {
    UnityInstance1?: any;
    UnityInstance2?: any;
    NotifyScore?: (score: number) => void;
    updateScoreInUI?: (score: number) => void;
  }
}


// Declare CSS Modules for TypeScript
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
