import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBa_3BcFsmVrNhKEoio21r11QTjMsQU-EY",
  authDomain: "notetakingapp-d63bc.firebaseapp.com",
  projectId: "notetakingapp-d63bc",
  storageBucket: "notetakingapp-d63bc.firebasestorage.app",
  messagingSenderId: "358757544610",
  appId: "1:358757544610:web:f0d011737562f3d684ddfb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (simple approach for Expo web compatibility)
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
