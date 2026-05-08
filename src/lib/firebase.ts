import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  type User, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
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

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

export async function logout() {
  await signOut(auth);
  window.location.reload();
}

export async function getCloudProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return snap.data();
  return null;
}

export async function saveCloudProfile(uid: string, data: any) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function addCredits(uid: string, amount: number) {
  await updateDoc(doc(db, "users", uid), {
    credits: increment(amount)
  });
}

let currentUser: User | null = null;
const waiters: ((u: User) => void)[] = [];

onAuthStateChanged(auth, (u) => {
  currentUser = u;
  if (u) {
    waiters.splice(0).forEach((w) => w(u));
  }
});

let authPromise: Promise<User> | null = null;

export async function ensureAuth(): Promise<User> {
  if (currentUser) return currentUser;
  if (auth.currentUser) { 
    currentUser = auth.currentUser; 
    return currentUser; 
  }
  if (authPromise) return authPromise;

  authPromise = new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        unsub();
        authPromise = null;
        currentUser = u;
        resolve(u);
      } else {
        signInAnonymously(auth).catch((err) => {
          authPromise = null;
          reject(err);
        });
      }
    });
  });
  return authPromise;
}
