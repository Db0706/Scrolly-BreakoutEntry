// firebaseConfig.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration object
const firebaseConfig = {

  apiKey: "AIzaSyAMGfoozJpQPsrUUDvIJIPoox-_52oKmao",

  authDomain: "ddgaming-users.firebaseapp.com",

  projectId: "ddgaming-users",

  storageBucket: "ddgaming-users.firebasestorage.app",

  messagingSenderId: "532080979221",

  appId: "1:532080979221:web:4f7790ee64e0dd59c88d1c",

  measurementId: "G-8WJV02QLYZ"

};


// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);
