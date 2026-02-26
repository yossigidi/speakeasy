// Setup global variables that the production app code expects
// Firebase initialization for SpeakEasy English learning app

import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  getDocs,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
  setDoc,
  orderBy,
  limit as firestoreLimit,
  increment
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  indexedDBLocalPersistence,
  setPersistence
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCWI1dPrkv168J06cSINAlQPeFn-KtrYxc",
  authDomain: "speakeasy-learn.firebaseapp.com",
  projectId: "speakeasy-learn",
  storageBucket: "speakeasy-learn.firebasestorage.app",
  messagingSenderId: "587097367180",
  appId: "1:587097367180:web:664be261020abb1df291a9"
};

const app = initializeApp(firebaseConfig);

// Enable offline persistence with multi-tab support
window.db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

window.auth = getAuth(app);

// Set explicit persistence for PWA / TWA compatibility
setPersistence(window.auth, indexedDBLocalPersistence).then(() => {
  console.log('Firebase Auth persistence set to IndexedDB');
}).catch((err) => {
  console.warn('Could not set IndexedDB persistence, using default:', err);
});

window.firestore = {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  query, getDocs, where, serverTimestamp,
  arrayUnion, arrayRemove, getDoc, setDoc,
  orderBy, firestoreLimit, increment
};

window.firebaseAuth = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
};

// Remove loading skeleton
window.hideLoadingSkeleton = function() {
  const skeleton = document.getElementById('loading-skeleton');
  if (skeleton && !skeleton.hiding) {
    skeleton.hiding = true;
    setTimeout(() => {
      skeleton.style.transition = 'opacity 1s ease-out';
      skeleton.style.opacity = '0';
      setTimeout(() => skeleton.remove(), 1000);
    }, 2000);
  }
};

// VAPID public key for Web Push notifications
window.VAPID_PUBLIC_KEY = 'BEvACofaoymhF0j7_DrrI7OLX40kU43sCjZl6u5SJCAlpcqm0Hj6sG_5QC9x1iQ2q2w0IkAQGnUenz4GfW6S_Uc';

// Performance timing
window.appLoadStart = performance.now();
