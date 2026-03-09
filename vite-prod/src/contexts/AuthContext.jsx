import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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
    window.firebaseAuth.getRedirectResult(window.auth)
      .then((result) => {
        if (result?.user) {
          // Redirect auth succeeded — user is set via onAuthStateChanged
          console.log('Redirect sign-in success:', result.user.email);
        }
      })
      .catch((err) => {
        if (err.code !== 'auth/null-user') {
          console.warn('Redirect sign-in error:', err);
        }
      });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new window.firebaseAuth.GoogleAuthProvider();
    return window.firebaseAuth.signInWithPopup(window.auth, provider);
  }, []);

  const signInWithApple = useCallback(async () => {
    const provider = new window.firebaseAuth.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    try {
      return await window.firebaseAuth.signInWithPopup(window.auth, provider);
    } catch (err) {
      // Popup blocked (common on iOS Safari) — fall back to redirect
      if (err.code === 'auth/popup-blocked') {
        return window.firebaseAuth.signInWithRedirect(window.auth, provider);
      }
      throw err;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    const cred = await window.firebaseAuth.createUserWithEmailAndPassword(window.auth, email, password);
    if (displayName) {
      await window.firebaseAuth.updateProfile(cred.user, { displayName });
    }
    return cred;
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    return window.firebaseAuth.signInWithEmailAndPassword(window.auth, email, password);
  }, []);

  const resetPassword = useCallback(async (email) => {
    return window.firebaseAuth.sendPasswordResetEmail(window.auth, email);
  }, []);

  const signOut = useCallback(async () => {
    return window.firebaseAuth.signOut(window.auth);
  }, []);

  const deleteAccount = useCallback(async () => {
    const currentUser = window.auth.currentUser;
    if (!currentUser) throw new Error('No user signed in');
    await window.firebaseAuth.deleteUser(currentUser);
    // Clear local storage
    localStorage.removeItem('speakeasy_activeChildId');
    localStorage.removeItem('speakeasy_childSession');
    sessionStorage.clear();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    signOut,
    deleteAccount,
    isAuthenticated: !!user,
  }), [user, loading, signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail, resetPassword, signOut, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
