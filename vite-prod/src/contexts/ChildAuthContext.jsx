import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ChildAuthContext = createContext(null);

const LOCKOUT_KEY = 'speakeasy_pin_lockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export function ChildAuthProvider({ children }) {
  const [childUser, setChildUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if current session is still valid
  const checkSessionExpiry = useCallback(() => {
    if (!childUser) return;
    if (childUser.expiresAt && new Date(childUser.expiresAt) <= new Date()) {
      localStorage.removeItem('speakeasy_childSession');
      setChildUser(null);
    }
  }, [childUser]);

  // Load child session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('speakeasy_childSession');
      if (saved) {
        const session = JSON.parse(saved);
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          setChildUser(session);
        } else {
          localStorage.removeItem('speakeasy_childSession');
        }
      }
    } catch {
      localStorage.removeItem('speakeasy_childSession');
    }
    setLoading(false);
  }, []);

  // Periodically check session expiry (every 5 minutes)
  useEffect(() => {
    if (!childUser) return;
    const interval = setInterval(checkSessionExpiry, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [childUser, checkSessionExpiry]);

  // SHA-256 hash for PIN verification
  const hashCredentials = useCallback(async (name, pin, familyCode) => {
    const normalized = name.trim().toLowerCase();
    const data = new TextEncoder().encode(normalized + pin + familyCode);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  // Rate limiting check
  const checkRateLimit = useCallback(() => {
    try {
      const lockout = JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}');
      if (lockout.lockedUntil && new Date(lockout.lockedUntil) > new Date()) {
        const minutesLeft = Math.ceil((new Date(lockout.lockedUntil) - new Date()) / 60000);
        return { locked: true, minutesLeft };
      }
      return { locked: false, attempts: lockout.attempts || 0 };
    } catch {
      return { locked: false, attempts: 0 };
    }
  }, []);

  const recordFailedAttempt = useCallback(() => {
    try {
      const lockout = JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}');
      const attempts = (lockout.attempts || 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        localStorage.setItem(LOCKOUT_KEY, JSON.stringify({
          attempts,
          lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
        }));
      } else {
        localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts }));
      }
    } catch { /* ignore */ }
  }, []);

  const clearRateLimit = useCallback(() => {
    localStorage.removeItem(LOCKOUT_KEY);
  }, []);

  // Ensure anonymous auth for Firestore access
  const ensureAuth = useCallback(async () => {
    if (!window.auth.currentUser) {
      await window.firebaseAuth.signInAnonymously(window.auth);
    }
  }, []);

  // Login child from separate device
  const loginChild = useCallback(async (familyCode, childId, childName, pin) => {
    // Check rate limit
    const rl = checkRateLimit();
    if (rl.locked) {
      return { success: false, error: 'tooManyAttempts', minutesLeft: rl.minutesLeft };
    }

    try {
      await ensureAuth();

      // Read child profile
      const childRef = window.firestore.doc(window.db, 'childProfiles', childId);
      const childSnap = await window.firestore.getDoc(childRef);

      if (!childSnap.exists()) {
        recordFailedAttempt();
        return { success: false, error: 'invalidPin' };
      }

      const childData = childSnap.data();

      // Verify PIN hash
      const hash = await hashCredentials(childName, pin, familyCode);
      if (hash !== childData.pinHash) {
        recordFailedAttempt();
        return { success: false, error: 'invalidPin' };
      }

      // Success - clear rate limit and create session
      clearRateLimit();

      const session = {
        childId,
        name: childData.name,
        avatar: childData.avatar,
        avatarColor: childData.avatarColor,
        age: childData.age,
        parentUid: childData.parentUid,
        familyCode,
        isRemoteChild: true,
        loginAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorage.setItem('speakeasy_childSession', JSON.stringify(session));
      setChildUser(session);
      return { success: true };
    } catch (error) {
      console.error('Child login error:', error);
      return { success: false, error: 'loginFailed' };
    }
  }, [hashCredentials, checkRateLimit, recordFailedAttempt, clearRateLimit, ensureAuth]);

  // Logout child
  const logoutChild = useCallback(() => {
    localStorage.removeItem('speakeasy_childSession');
    setChildUser(null);
  }, []);

  // Fetch children list by family code
  const fetchChildrenByCode = useCallback(async (familyCode) => {
    try {
      await ensureAuth();

      const docRef = window.firestore.doc(window.db, 'parentChildren', familyCode);
      const docSnap = await window.firestore.getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn('parentChildren doc not found for code:', familyCode);
        // Also try lowercase in case of mismatch
        const lowerRef = window.firestore.doc(window.db, 'parentChildren', familyCode.toLowerCase());
        const lowerSnap = await window.firestore.getDoc(lowerRef);
        if (lowerSnap.exists()) {
          const data = lowerSnap.data();
          return { success: true, children: data.children || [] };
        }
        return { success: false, error: 'invalidFamilyCode' };
      }

      const data = docSnap.data();
      return { success: true, children: data.children || [] };
    } catch (error) {
      console.error('Fetch children error:', error);
      return { success: false, error: 'authFailed' };
    }
  }, [ensureAuth]);

  const value = {
    childUser,
    loading,
    loginChild,
    logoutChild,
    hashCredentials,
    fetchChildrenByCode,
    checkRateLimit,
  };

  return <ChildAuthContext.Provider value={value}>{children}</ChildAuthContext.Provider>;
}

export function useChildAuth() {
  const context = useContext(ChildAuthContext);
  if (!context) throw new Error('useChildAuth must be used within ChildAuthProvider');
  return context;
}
