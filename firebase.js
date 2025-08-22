// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB2fTfXCH-boAIdmp88NdOyp-JS15mlcFY",
  authDomain: "smartexpenseapp-e9bf2.firebaseapp.com",
  projectId: "smartexpenseapp-e9bf2",
  storageBucket: "smartexpenseapp-e9bf2.firebasestorage.app",
  messagingSenderId: "371878728475",
  appId: "1:371878728475:web:98084d6d858b1c2f30f9be"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
