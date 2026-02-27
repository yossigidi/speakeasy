import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getLevelInfo, getXPForLevel } from '../utils/levelSystem.js';

const UserProgressContext = createContext(null);

const DEFAULT_PROGRESS = {
  xp: 0,
  level: 1,
  cefrLevel: 'A1',
  curriculumLevel: 1,
  streak: 0,
  lastActiveDate: null,
  dailyGoalMinutes: 10,
  dailyXP: 0,
  dailyMinutes: 0,
  totalWordsLearned: 0,
  totalLessonsCompleted: 0,
  longestStreak: 0,
  motivation: 'fun',
  streakFreezes: 0,
  onboardingComplete: false,
  ageGroup: null,
  lettersCompleted: [],
};

const CHILD_LS_KEY = 'speakeasy_activeChildId';

// Generate random 6-char alphanumeric code
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0,O,1,I for clarity
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// SHA-256 hash
async function hashCredentials(name, pin, familyCode) {
  const normalized = name.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized + pin + familyCode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function UserProgressProvider({ children: reactChildren }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [activeChildId, setActiveChildId] = useState(() => localStorage.getItem(CHILD_LS_KEY) || null);
  const [childrenList, setChildrenList] = useState([]);
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const [familyCode, setFamilyCode] = useState(null);

  const isChildMode = !!activeChildId;

  // Persist activeChildId to localStorage
  useEffect(() => {
    if (activeChildId) {
      localStorage.setItem(CHILD_LS_KEY, activeChildId);
    } else {
      localStorage.removeItem(CHILD_LS_KEY);
    }
  }, [activeChildId]);

  // Subscribe to user doc (for familyCode and childrenIds)
  useEffect(() => {
    if (!user) {
      setFamilyCode(null);
      return;
    }

    const userRef = window.firestore.doc(window.db, 'users', user.uid);
    const unsub = window.firestore.onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setFamilyCode(data.familyCode || null);
      }
    });

    return unsub;
  }, [user]);

  // Ensure parentChildren doc exists when familyCode + children are loaded
  useEffect(() => {
    if (!user || !familyCode || childrenList.length === 0) return;
    const pcRef = window.firestore.doc(window.db, 'parentChildren', familyCode);
    window.firestore.getDoc(pcRef).then(snap => {
      if (!snap.exists()) {
        const entries = childrenList.map(c => ({
          childId: c.id,
          name: c.name,
          avatar: c.avatar,
          avatarColor: c.avatarColor,
        }));
        window.firestore.setDoc(pcRef, { children: entries, parentUid: user.uid })
          .catch(e => console.warn('Auto-sync parentChildren failed:', e));
      }
    }).catch(() => {});
  }, [user, familyCode, childrenList]);

  // Subscribe to children via childProfiles (by childrenIds from user doc)
  useEffect(() => {
    if (!user) {
      setChildrenList([]);
      setChildrenLoaded(true);
      return;
    }

    setChildrenLoaded(false);

    // First try the new top-level childProfiles collection
    const userRef = window.firestore.doc(window.db, 'users', user.uid);

    const unsub = window.firestore.onSnapshot(userRef, async (userSnap) => {
      if (!userSnap.exists()) {
        setChildrenList([]);
        setChildrenLoaded(true);
        return;
      }

      const userData = userSnap.data();
      const childrenIds = userData.childrenIds || [];

      if (childrenIds.length === 0) {
        // Check for legacy subcollection children and migrate
        try {
          const legacyRef = window.firestore.collection(window.db, 'users', user.uid, 'children');
          const legacySnap = await window.firestore.getDocs(legacyRef);
          if (!legacySnap.empty) {
            // Lazy migration from subcollection to top-level
            await migrateChildren(user.uid, legacySnap.docs, userData.familyCode);
            return; // The migration will trigger this listener again
          }
        } catch (e) {
          console.warn('Legacy children check failed:', e);
        }
        setChildrenList([]);
        setChildrenLoaded(true);
        return;
      }

      // Fetch all child profiles
      const kids = [];
      for (const cid of childrenIds) {
        try {
          const childSnap = await window.firestore.getDoc(
            window.firestore.doc(window.db, 'childProfiles', cid)
          );
          if (childSnap.exists()) {
            const childData = childSnap.data();
            // Lazy migration: assign childLevel if missing
            if (childData.childLevel == null) {
              let defaultLevel = 1;
              if (childData.age) {
                const age = parseInt(childData.age, 10);
                if (age >= 9) defaultLevel = 4;
                else if (age >= 7) defaultLevel = 3;
                else if (age >= 6) defaultLevel = 2;
              }
              childData.childLevel = defaultLevel;
              // Also fix ageGroup if needed (old threshold was 8, new is 10)
              if (childData.age) {
                const age = parseInt(childData.age, 10);
                childData.ageGroup = age >= 10 ? 'teens' : 'kids';
              }
              window.firestore.setDoc(
                window.firestore.doc(window.db, 'childProfiles', cid),
                { childLevel: defaultLevel, ageGroup: childData.ageGroup },
                { merge: true }
              ).catch(e => console.warn('Lazy migration failed:', cid, e));
            }
            kids.push({ id: childSnap.id, ...childData });
          }
        } catch (e) {
          console.warn('Failed to fetch child:', cid, e);
        }
      }
      setChildrenList(kids);
      setChildrenLoaded(true);

      // If activeChildId no longer exists, switch to parent
      if (activeChildId && !kids.find(k => k.id === activeChildId)) {
        setActiveChildId(null);
      }
    });

    return unsub;
  }, [user]);

  // Lazy migration helper
  async function migrateChildren(parentUid, legacyDocs, existingFamilyCode) {
    try {
      let code = existingFamilyCode;
      if (!code) {
        code = generateCode();
        await window.firestore.setDoc(
          window.firestore.doc(window.db, 'users', parentUid),
          { familyCode: code },
          { merge: true }
        );
      }

      const childrenIds = [];
      const childrenEntries = [];

      for (const legDoc of legacyDocs) {
        const data = legDoc.data();
        const childId = legDoc.id;
        childrenIds.push(childId);

        // Write to top-level childProfiles
        await window.firestore.setDoc(
          window.firestore.doc(window.db, 'childProfiles', childId),
          {
            ...data,
            parentUid,
            pinHash: null, // No PIN yet for migrated children
            createdAt: data.createdAt || window.firestore.serverTimestamp(),
          }
        );

        childrenEntries.push({
          childId,
          name: data.name,
          avatar: data.avatar,
          avatarColor: data.avatarColor,
        });
      }

      // Update parentChildren directory
      await window.firestore.setDoc(
        window.firestore.doc(window.db, 'parentChildren', code),
        { children: childrenEntries, parentUid }
      );

      // Update user doc with childrenIds
      await window.firestore.setDoc(
        window.firestore.doc(window.db, 'users', parentUid),
        { childrenIds },
        { merge: true }
      );

      console.log('Migration complete for', childrenIds.length, 'children');
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }

  // Subscribe to the active document (parent or child)
  useEffect(() => {
    if (!user) {
      setProgress(DEFAULT_PROGRESS);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Child profiles are now in top-level collection
    const docRef = activeChildId
      ? window.firestore.doc(window.db, 'childProfiles', activeChildId)
      : window.firestore.doc(window.db, 'users', user.uid);

    const cefrToLevel = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

    const unsub = window.firestore.onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Backward-compat migration: cefrLevel → curriculumLevel
        if (data.cefrLevel && !data.curriculumLevel) {
          const mapped = cefrToLevel[data.cefrLevel] || 1;
          data.curriculumLevel = mapped;
          // Persist the migration
          window.firestore.setDoc(docRef, { curriculumLevel: mapped }, { merge: true })
            .catch(e => console.warn('curriculumLevel migration failed:', e));
        }
        setProgress({ ...DEFAULT_PROGRESS, ...data });
      } else if (!activeChildId) {
        // Create initial parent user doc
        window.firestore.setDoc(docRef, {
          displayName: user.displayName || '',
          email: user.email || '',
          createdAt: window.firestore.serverTimestamp(),
        }, { merge: true });
      } else {
        // Child doc was deleted while active — switch to parent
        setActiveChildId(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('UserProgress onSnapshot error:', err);
      setLoading(false);
    });

    return unsub;
  }, [user, activeChildId]);

  const updateProgress = useCallback(async (updates) => {
    if (!user) return;
    const docRef = activeChildId
      ? window.firestore.doc(window.db, 'childProfiles', activeChildId)
      : window.firestore.doc(window.db, 'users', user.uid);
    await window.firestore.setDoc(docRef, updates, { merge: true });
  }, [user, activeChildId]);

  const addXP = useCallback(async (amount, source = 'unknown') => {
    if (!user || amount <= 0) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const newXP = progress.xp + amount;
      const newDailyXP = (progress.lastActiveDate === today ? progress.dailyXP : 0) + amount;
      const levelInfo = getLevelInfo(newXP);

      // Streak logic
      let newStreak = progress.streak;
      let newLongest = progress.longestStreak;
      if (progress.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (progress.lastActiveDate === yesterdayStr) {
          newStreak = progress.streak + 1;
        } else if (progress.lastActiveDate !== today) {
          if (progress.streakFreezes > 0) {
            newStreak = progress.streak;
          } else {
            newStreak = 1;
          }
        }
        newLongest = Math.max(newLongest, newStreak);
      }

      const updates = {
        xp: newXP,
        level: levelInfo.level,
        dailyXP: newDailyXP,
        streak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
      };

      await updateProgress(updates);

      // Log daily activity — route to correct subcollection
      try {
        const activityPath = activeChildId
          ? ['childProfiles', activeChildId, 'dailyActivity', today]
          : ['users', user.uid, 'dailyActivity', today];
        const activityRef = window.firestore.doc(window.db, ...activityPath);
        const activitySnap = await window.firestore.getDoc(activityRef);
        if (activitySnap.exists()) {
          await window.firestore.updateDoc(activityRef, {
            xp: window.firestore.increment(amount),
            [`sources.${source}`]: window.firestore.increment(amount),
          });
        } else {
          await window.firestore.setDoc(activityRef, {
            date: today,
            xp: amount,
            minutes: 0,
            sources: { [source]: amount },
          });
        }
      } catch (activityErr) {
        console.warn('Failed to log daily activity:', activityErr);
      }

      return { leveledUp: levelInfo.level > progress.level, newLevel: levelInfo.level };
    } catch (err) {
      console.error('addXP failed:', err);
      return { leveledUp: false, newLevel: progress.level };
    }
  }, [user, progress, updateProgress, activeChildId]);

  // --- Family management functions ---

  const generateFamilyCode = useCallback(async () => {
    if (!user) return null;
    const code = generateCode();
    await window.firestore.setDoc(
      window.firestore.doc(window.db, 'users', user.uid),
      { familyCode: code },
      { merge: true }
    );
    setFamilyCode(code);

    // Also create/update parentChildren document so child login works
    if (childrenList.length > 0) {
      const childrenEntries = childrenList.map(c => ({
        childId: c.id,
        name: c.name,
        avatar: c.avatar,
        avatarColor: c.avatarColor,
      }));
      await window.firestore.setDoc(
        window.firestore.doc(window.db, 'parentChildren', code),
        { children: childrenEntries, parentUid: user.uid }
      );
    }

    return code;
  }, [user, childrenList]);

  const switchToChild = useCallback((childId) => {
    // Clear session-scoped state so new child gets fresh intro/welcome
    sessionStorage.clear();
    setActiveChildId(childId);
  }, []);

  const switchToParent = useCallback(() => {
    sessionStorage.clear();
    setActiveChildId(null);
  }, []);

  const addChild = useCallback(async (data) => {
    // data = { name, avatar, avatarColor, age, pin }
    if (!user) return null;

    // Ensure family code exists
    let code = familyCode;
    if (!code) {
      code = await generateFamilyCode();
    }

    // Generate child ID
    const childId = crypto.randomUUID ? crypto.randomUUID() :
      'child_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Hash PIN if provided
    let pinHash = null;
    if (data.pin) {
      pinHash = await hashCredentials(data.name, data.pin, code);
    }

    // Determine age group from age — kids (<10) vs teens (10+)
    let ageGroup = 'kids';
    if (data.age) {
      const age = parseInt(data.age, 10);
      if (age >= 10) ageGroup = 'teens';
    }

    // Determine child level (1-4) based on age
    let childLevel = 1;
    if (data.age) {
      const age = parseInt(data.age, 10);
      if (age >= 9) childLevel = 4;
      else if (age >= 7) childLevel = 3;
      else if (age >= 6) childLevel = 2;
    }

    // Write to childProfiles/{childId}
    await window.firestore.setDoc(
      window.firestore.doc(window.db, 'childProfiles', childId),
      {
        name: data.name,
        avatar: data.avatar,
        avatarColor: data.avatarColor,
        age: data.age || null,
        parentUid: user.uid,
        pinHash,
        createdAt: window.firestore.serverTimestamp(),
        xp: 0,
        level: 1,
        cefrLevel: 'A1',
        streak: 0,
        lastActiveDate: null,
        dailyGoalMinutes: 10,
        dailyXP: 0,
        dailyMinutes: 0,
        totalWordsLearned: 0,
        totalLessonsCompleted: 0,
        longestStreak: 0,
        streakFreezes: 0,
        ageGroup,
        childLevel,
        curriculumLevel: childLevel,
        onboardingComplete: true,
        lettersCompleted: [],
      }
    );

    // Update parentChildren/{familyCode}
    const parentChildrenRef = window.firestore.doc(window.db, 'parentChildren', code);
    const parentChildrenSnap = await window.firestore.getDoc(parentChildrenRef);
    const existingChildren = parentChildrenSnap.exists() ? (parentChildrenSnap.data().children || []) : [];

    await window.firestore.setDoc(parentChildrenRef, {
      children: [...existingChildren, {
        childId,
        name: data.name,
        avatar: data.avatar,
        avatarColor: data.avatarColor,
      }],
      parentUid: user.uid,
    });

    // Update users/{uid}.childrenIds
    await window.firestore.setDoc(
      window.firestore.doc(window.db, 'users', user.uid),
      { childrenIds: window.firestore.arrayUnion(childId) },
      { merge: true }
    );

    return childId;
  }, [user, familyCode, generateFamilyCode]);

  const updateChild = useCallback(async (childId, data) => {
    if (!user) return;
    const childRef = window.firestore.doc(window.db, 'childProfiles', childId);
    await window.firestore.setDoc(childRef, data, { merge: true });

    // Update parentChildren directory if name/avatar changed
    if (data.name || data.avatar || data.avatarColor) {
      if (familyCode) {
        const pcRef = window.firestore.doc(window.db, 'parentChildren', familyCode);
        const pcSnap = await window.firestore.getDoc(pcRef);
        if (pcSnap.exists()) {
          const children = (pcSnap.data().children || []).map(c =>
            c.childId === childId
              ? { ...c, ...(data.name && { name: data.name }), ...(data.avatar && { avatar: data.avatar }), ...(data.avatarColor && { avatarColor: data.avatarColor }) }
              : c
          );
          await window.firestore.setDoc(pcRef, { children }, { merge: true });
        }
      }
    }
  }, [user, familyCode]);

  const deleteChild = useCallback(async (childId) => {
    if (!user) return;
    // If deleting the active child, switch to parent first
    if (activeChildId === childId) {
      setActiveChildId(null);
    }

    // Delete from childProfiles
    await window.firestore.deleteDoc(
      window.firestore.doc(window.db, 'childProfiles', childId)
    );

    // Remove from parentChildren
    if (familyCode) {
      const pcRef = window.firestore.doc(window.db, 'parentChildren', familyCode);
      const pcSnap = await window.firestore.getDoc(pcRef);
      if (pcSnap.exists()) {
        const children = (pcSnap.data().children || []).filter(c => c.childId !== childId);
        await window.firestore.setDoc(pcRef, { children }, { merge: true });
      }
    }

    // Remove from users/{uid}.childrenIds
    await window.firestore.setDoc(
      window.firestore.doc(window.db, 'users', user.uid),
      { childrenIds: window.firestore.arrayRemove(childId) },
      { merge: true }
    );
  }, [user, activeChildId, familyCode]);

  const resetChildPin = useCallback(async (childId, childName, newPin) => {
    if (!user || !familyCode) return;
    const pinHash = await hashCredentials(childName, newPin, familyCode);
    await window.firestore.setDoc(
      window.firestore.doc(window.db, 'childProfiles', childId),
      { pinHash },
      { merge: true }
    );
  }, [user, familyCode]);

  const updateChildLevel = useCallback(async (childId, newLevel) => {
    if (!user) return;
    await window.firestore.setDoc(
      window.firestore.doc(window.db, 'childProfiles', childId),
      { childLevel: newLevel },
      { merge: true }
    );
  }, [user]);

  const activeChild = useMemo(() => {
    if (!activeChildId) return null;
    return childrenList.find(c => c.id === activeChildId) || null;
  }, [activeChildId, childrenList]);

  const levelInfo = useMemo(() => getLevelInfo(progress.xp), [progress.xp]);

  const value = useMemo(() => ({
    progress,
    loading,
    updateProgress,
    addXP,
    levelInfo,
    // Family
    activeChildId,
    activeChild,
    isChildMode,
    children: childrenList,
    childrenLoaded,
    familyCode,
    switchToChild,
    switchToParent,
    addChild,
    updateChild,
    deleteChild,
    generateFamilyCode,
    resetChildPin,
    updateChildLevel,
  }), [progress, loading, updateProgress, addXP, levelInfo, activeChildId, activeChild,
       isChildMode, childrenList, childrenLoaded, familyCode, switchToChild, switchToParent,
       addChild, updateChild, deleteChild, generateFamilyCode, resetChildPin, updateChildLevel]);

  return <UserProgressContext.Provider value={value}>{reactChildren}</UserProgressContext.Provider>;
}

export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (!context) throw new Error('useUserProgress must be used within UserProgressProvider');
  return context;
}
