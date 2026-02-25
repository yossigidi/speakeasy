import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getLevelInfo, getXPForLevel } from '../utils/levelSystem.js';

const UserProgressContext = createContext(null);

const DEFAULT_PROGRESS = {
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
  motivation: 'fun',
  streakFreezes: 0,
  onboardingComplete: false,
  ageGroup: null, // 'kids' (4-7), 'children' (8-12), 'teens' (13-17), 'adults' (18+)
  lettersCompleted: [], // for kids mode - track which letters are done
};

const CHILD_LS_KEY = 'speakeasy_activeChildId';

export function UserProgressProvider({ children: reactChildren }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [activeChildId, setActiveChildId] = useState(() => localStorage.getItem(CHILD_LS_KEY) || null);
  const [childrenList, setChildrenList] = useState([]);

  const isChildMode = !!activeChildId;

  // Persist activeChildId to localStorage
  useEffect(() => {
    if (activeChildId) {
      localStorage.setItem(CHILD_LS_KEY, activeChildId);
    } else {
      localStorage.removeItem(CHILD_LS_KEY);
    }
  }, [activeChildId]);

  // Subscribe to children collection
  useEffect(() => {
    if (!user) {
      setChildrenList([]);
      return;
    }

    const childrenRef = window.firestore.collection(window.db, 'users', user.uid, 'children');
    const unsub = window.firestore.onSnapshot(childrenRef, (snap) => {
      const kids = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChildrenList(kids);

      // If activeChildId no longer exists in the list, switch to parent
      if (activeChildId && !kids.find(k => k.id === activeChildId)) {
        setActiveChildId(null);
      }
    }, (err) => {
      console.error('Children collection onSnapshot error:', err);
    });

    return unsub;
  }, [user]);

  // Subscribe to the active document (parent or child)
  useEffect(() => {
    if (!user) {
      setProgress(DEFAULT_PROGRESS);
      setLoading(false);
      return;
    }

    setLoading(true);

    const docRef = activeChildId
      ? window.firestore.doc(window.db, 'users', user.uid, 'children', activeChildId)
      : window.firestore.doc(window.db, 'users', user.uid);

    const unsub = window.firestore.onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setProgress({ ...DEFAULT_PROGRESS, ...snap.data() });
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
      ? window.firestore.doc(window.db, 'users', user.uid, 'children', activeChildId)
      : window.firestore.doc(window.db, 'users', user.uid);
    await window.firestore.setDoc(docRef, updates, { merge: true });
  }, [user, activeChildId]);

  const addXP = useCallback(async (amount, source = 'unknown') => {
    if (!user || amount <= 0) return;

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
    const activityPath = activeChildId
      ? ['users', user.uid, 'children', activeChildId, 'dailyActivity', today]
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

    return { leveledUp: levelInfo.level > progress.level, newLevel: levelInfo.level };
  }, [user, progress, updateProgress, activeChildId]);

  // --- Family management functions ---

  const switchToChild = useCallback((childId) => {
    setActiveChildId(childId);
  }, []);

  const switchToParent = useCallback(() => {
    setActiveChildId(null);
  }, []);

  const addChild = useCallback(async (data) => {
    if (!user) return null;
    const childrenRef = window.firestore.collection(window.db, 'users', user.uid, 'children');
    const childDoc = window.firestore.doc(childrenRef);
    await window.firestore.setDoc(childDoc, {
      name: data.name,
      avatar: data.avatar,
      avatarColor: data.avatarColor,
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
      ageGroup: 'kids',
      onboardingComplete: true,
      lettersCompleted: [],
    });
    return childDoc.id;
  }, [user]);

  const updateChild = useCallback(async (childId, data) => {
    if (!user) return;
    const childRef = window.firestore.doc(window.db, 'users', user.uid, 'children', childId);
    await window.firestore.setDoc(childRef, data, { merge: true });
  }, [user]);

  const deleteChild = useCallback(async (childId) => {
    if (!user) return;
    // If deleting the active child, switch to parent first
    if (activeChildId === childId) {
      setActiveChildId(null);
    }
    const childRef = window.firestore.doc(window.db, 'users', user.uid, 'children', childId);
    await window.firestore.deleteDoc(childRef);
  }, [user, activeChildId]);

  const activeChild = useMemo(() => {
    if (!activeChildId) return null;
    return childrenList.find(c => c.id === activeChildId) || null;
  }, [activeChildId, childrenList]);

  const value = {
    progress,
    loading,
    updateProgress,
    addXP,
    levelInfo: getLevelInfo(progress.xp),
    // Family
    activeChildId,
    activeChild,
    isChildMode,
    children: childrenList,
    switchToChild,
    switchToParent,
    addChild,
    updateChild,
    deleteChild,
  };

  return <UserProgressContext.Provider value={value}>{reactChildren}</UserProgressContext.Provider>;
}

export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (!context) throw new Error('useUserProgress must be used within UserProgressProvider');
  return context;
}
