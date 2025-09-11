
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAhRQ5KKBaQ9Wn4IBXuOnwR_Lw7nz9YeH0",
  authDomain: "streamed-310f8.firebaseapp.com",
  projectId: "streamed-310f8",
  storageBucket: "streamed-310f8.firebasestorage.app",
  messagingSenderId: "882013640046",
  appId: "1:882013640046:web:bb1dce93a93ee4011c5d7f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
