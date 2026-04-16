import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEq_5QmO6toZlFc8aJYMAq249QRiO-jAo",
  authDomain: "enerman-8a7cb.firebaseapp.com",
  projectId: "enerman-8a7cb",
  storageBucket: "enerman-8a7cb.firebasestorage.app",
  messagingSenderId: "411591983458",
  appId: "1:411591983458:web:e21f373a4c973e58722c3b",
  measurementId: "G-3ZRTSBYC3E"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
