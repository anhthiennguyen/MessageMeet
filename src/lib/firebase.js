import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAUbRYI5ji2uNVhAz0b9a1pCdicItwbEQ",
  authDomain: "portfolio-ec9ef.firebaseapp.com",
  projectId: "portfolio-ec9ef",
  storageBucket: "portfolio-ec9ef.firebasestorage.app",
  messagingSenderId: "751548018498",
  appId: "1:751548018498:web:cfd28296f2b4f0a081e2db",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
