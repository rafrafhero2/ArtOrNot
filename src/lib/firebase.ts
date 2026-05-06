import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAKLywBo0h1e-CRjbA8tJG9jAQAW193jVk",
  authDomain: "aiphonegang.firebaseapp.com",
  databaseURL: "https://aiphonegang-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aiphonegang",
  storageBucket: "aiphonegang.firebasestorage.app",
  messagingSenderId: "882908885555",
  appId: "1:882908885555:web:8402fcfc8b7c0bdb2aa946",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

let currentUser: User | null = null;
const waiters: ((u: User) => void)[] = [];

onAuthStateChanged(auth, (u) => {
  if (u) {
    currentUser = u;
    waiters.splice(0).forEach((w) => w(u));
  }
});

export async function ensureAuth(): Promise<User> {
  if (currentUser) return currentUser;
  if (!auth.currentUser) {
    try { await signInAnonymously(auth); } catch (e) { console.error("anon auth", e); }
  }
  if (auth.currentUser) { currentUser = auth.currentUser; return currentUser; }
  return new Promise((resolve) => waiters.push(resolve));
}
