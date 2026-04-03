import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuguEeuD8Ci1A2LaXlCC0OTCkKVCSRB54",
  authDomain: "resume---ai.firebaseapp.com",
  projectId: "resume---ai",
  storageBucket: "resume---ai.firebasestorage.app",
  messagingSenderId: "347880411314",
  appId: "1:347880411314:web:ecb3fa5904df811f8879ab",
  measurementId: "G-3RE4YQ545N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
