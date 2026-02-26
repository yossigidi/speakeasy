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

  // Handle redirect result (for Apple Sign-In on iOS/Safari)
  useEffect(() => {
    window.firebaseAuth.getRedirectResult(window.auth).catch((err) => {
      if (err.code !== 'auth/null-user') {
        console.warn('Redirect sign-in error:', err);
      }
    });
  }, []);

  const signInWithGoogle = async () => {
    const provider = new window.firebaseAuth.GoogleAuthProvider();
    return window.firebaseAuth.signInWithPopup(window.auth, provider);
  };

  const signInWithApple = async () => {
    const provider = new window.firebaseAuth.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    try {
      return await window.firebaseAuth.signInWithPopup(window.auth, provider);
    } catch (err) {
      // Popup blocked (common on iOS Safari) — fall back to redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        return window.firebaseAuth.signInWithRedirect(window.auth, provider);
      }
      throw err;
    }
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
    signInWithApple,
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
