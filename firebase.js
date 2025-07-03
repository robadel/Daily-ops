// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaiiVsupWaY-43DhIxr4qwtI40FhR1IhI",
  authDomain: "dailyops-roberts.firebaseapp.com",
  projectId: "dailyops-roberts",
  storageBucket: "dailyops-roberts.firebasestorage.app",
  messagingSenderId: "1094843978509",
  appId: "1:1094843978509:web:3486047b0856ccff389644",
  measurementId: "G-SEBZJPCW28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

