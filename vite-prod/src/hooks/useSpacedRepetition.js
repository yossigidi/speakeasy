import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { calculateSM2, getInitialSM2, QUALITY_MAP } from '../utils/sm2.js';
import { getToday } from '../utils/dateUtils.js';

export default function useSpacedRepetition() {
  const { user } = useAuth();
  const [dueWords, setDueWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch due words from Firestore
  useEffect(() => {
    if (!user || !window.firestore || !window.db) {
      setDueWords([]);
      setIsLoading(false);
      return;
    }

    let unsub = null;

    // Wait for auth token so Firestore security rules recognize the user
    user.getIdToken().then(() => {
      const today = getToday();
      const vocabRef = window.firestore.collection(window.db, 'users', user.uid, 'vocabulary');
      const q = window.firestore.query(
        vocabRef,
        window.firestore.where('nextReviewDate', '<=', today)
      );

      unsub = window.firestore.onSnapshot(q, (snap) => {
        const words = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        words.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
        setDueWords(words);
        setIsLoading(false);
      }, (err) => {
        console.error('SpacedRepetition onSnapshot error:', err);
        setIsLoading(false);
      });
    }).catch(() => setIsLoading(false));

    return () => { if (unsub) unsub(); };
  }, [user]);

  const reviewWord = useCallback(async (wordId, qualityLabel) => {
    if (!user || !window.firestore || !window.db) return;

    const quality = QUALITY_MAP[qualityLabel] ?? qualityLabel;
    const wordRef = window.firestore.doc(window.db, 'users', user.uid, 'vocabulary', wordId);
    const snap = await window.firestore.getDoc(wordRef);

    if (!snap.exists()) return;

    const data = snap.data();
    const result = calculateSM2(
      quality,
      data.repetitions || 0,
      data.easeFactor || 2.5,
      data.interval || 0
    );

    await window.firestore.updateDoc(wordRef, {
      ...result,
      lastReviewed: getToday(),
      reviewCount: (data.reviewCount || 0) + 1,
    });

    return result;
  }, [user]);

  const addWord = useCallback(async (wordData) => {
    if (!user || !window.firestore || !window.db) return;

    const vocabRef = window.firestore.doc(
      window.db, 'users', user.uid, 'vocabulary', wordData.id || wordData.word
    );

    const existing = await window.firestore.getDoc(vocabRef);
    if (existing.exists()) return; // Already added

    await window.firestore.setDoc(vocabRef, {
      ...wordData,
      ...getInitialSM2(),
      addedAt: getToday(),
      reviewCount: 0,
    });
  }, [user]);

  return {
    dueWords,
    dueCount: dueWords.length,
    reviewWord,
    addWord,
    isLoading,
  };
}
