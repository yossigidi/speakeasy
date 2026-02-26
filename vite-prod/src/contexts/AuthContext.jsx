import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = window.firebaseAuth.onAuthStateChanged(window.auth, (firebaseUser) => {
      // Ignore anonymous users - they're only used for child login Firestore access
      setUser(firebaseUser?.isAnonymous ? null : firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new window.firebaseAuth.GoogleAuthProvider();
    return window.firebaseAuth.signInWithPopup(window.auth, provider);
  };

  const signUpWithEmail = async (email, password, displayName) => {
    const cred = await window.firebaseAuth.createUserWithEmailAndPassword(window.auth, email, password);
    if (displayName) {
      await window.firebaseAuth.updateProfile(cred.user, { displayName });
    }
    return cred;
  };

  const signInWithEmail = async (email, password) => {
    return window.firebaseAuth.signInWithEmailAndPassword(window.auth, email, password);
  };

  const signOut = async () => {
    return window.firebaseAuth.signOut(window.auth);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
