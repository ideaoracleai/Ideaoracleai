// Firebase Configuration for IdeaOracle.ai
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAawV2c9DZT-U2TaniIxXcf8PshPXaMo-s",
    authDomain: "ideaoracleai-3a7df.firebaseapp.com",
    projectId: "ideaoracleai-3a7df",
    storageBucket: "ideaoracleai-3a7df.firebasestorage.app",
    messagingSenderId: "161681005203",
    appId: "1:161681005203:web:b51c66526ecb652f66cb66",
    measurementId: "G-KCXYK3FBV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
