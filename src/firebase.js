import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// REPLACE THIS OBJECT WITH YOUR OWN FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyDaITUTfsRM4L7ouQXabcv3mL0WucW9vRA",
  authDomain: "fairshare-704e3.firebaseapp.com",
  projectId: "fairshare-704e3",
  storageBucket: "fairshare-704e3.firebasestorage.app",
  messagingSenderId: "187025211996",
  appId: "1:187025211996:web:bc575128fdcf1347ea5c99",
  measurementId: "G-FH2DTX97N7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = "fairshare-web"; // You can keep this string