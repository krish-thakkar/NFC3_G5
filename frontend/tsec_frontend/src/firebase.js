import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "g5farmer.firebaseapp.com",
  projectId: "g5farmer",
  storageBucket: "g5farmer.appspot.com",
  messagingSenderId: "SENDER_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
