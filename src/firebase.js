import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // Import GoogleAuthProvider directly
import { getFirestore } from 'firebase/firestore';

// 🔴 REPLACE THESE WITH YOUR KEYS FROM FIREBASE CONSOLE 🔴
const firebaseConfig = {
  apiKey: "AIzaSyDaITUTfsRM4L7ouQXabcv3mL0WucW9vRA",
  authDomain: "fairshare-704e3.firebaseapp.com",
  projectId: "fairshare-704e3",
  storageBucket: "fairshare-704e3.firebasestorage.app",
  messagingSenderId: "187025211996",
  appId: "1:187025211996:web:bc575128fdcf1347ea5c99",
  measurementId: "G-FH2DTX97N7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // Correct usage
export const appId = "fairshare-web";