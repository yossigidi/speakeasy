import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import TeacherCharacter from '../components/teacher/TeacherCharacter.jsx';
import SpeechBubble from '../components/teacher/SpeechBubble.jsx';
import ExerciseRenderer from '../components/teacher/ExerciseRenderer.jsx';
import ConfettiExplosion from '../components/shared/ConfettiExplosion.jsx';
import KidsIntro from '../components/kids/KidsIntro.jsx';
import { playCorrect, playWrong, playComplete, playStar } from '../utils/gameSounds.js';
import { stopAllAudio } from '../utils/hebrewAudio.js';
import { WORDS_BY_LEVEL } from '../data/kids-vocabulary.js';
import { t, RTL_LANGS } from '../utils/translations.js';

const TEACHER_TOPICS = [
  { id: 'colors', emoji: '🎨', titleHe: 'צבעים', titleEn: 'Colors', level: 1, gradient: 'linear-gradient(135deg, #FF6B6B, #FFE66D)' },
  { id: 'animals', emoji: '🐾', titleHe: 'חיות', titleEn: 'Animals', level: 1, gradient: 'linear-gradient(135deg, #4ECDC4, #44CF6C)' },
  { id: 'numbers', emoji: '🔢', titleHe: 'מספרים', titleEn: 'Numbers', level: 1, gradient: 'linear-gradient(135deg, #A78BFA, #818CF8)' },
  { id: 'fruits', emoji: '🍎', titleHe: 'פירות', titleEn: 'Fruits', level: 1, gradient: 'linear-gradient(135deg, #F472B6, #FB923C)' },
  { id: 'greetings', emoji: '👋', titleHe: 'ברכות', titleEn: 'Greetings', level: 1, gradient: 'linear-gradient(135deg, #60A5FA, #34D399)' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', titleHe: 'משפחה', titleEn: 'Family', level: 2, gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  { id: 'body', emoji: '🦶', titleHe: 'גוף', titleEn: 'Body', level: 2, gradient: 'linear-gradient(135deg, #EC4899, #8B5CF6)' },
  { id: 'classroom', emoji: '🏫', titleHe: 'כיתה', titleEn: 'Classroom', level: 2, gradient: 'linear-gradient(135deg, #14B8A6, #3B82F6)' },
  { id: 'food', emoji: '🍔', titleHe: 'אוכל', titleEn: 'Food', level: 2, gradient: 'linear-gradient(135deg, #F97316, #FACC15)' },
  { id: 'sizes', emoji: '📏', titleHe: 'גדלים', titleEn: 'Sizes', level: 2, gradient: 'linear-gradient(135deg, #6366F1, #EC4899)' },
  { id: 'weather', emoji: '🌤️', titleHe: 'מזג אוויר', titleEn: 'Weather', level: 3, gradient: 'linear-gradient(135deg, #38BDF8, #818CF8)' },
  { id: 'home', emoji: '🏠', titleHe: 'הבית', titleEn: 'Home', level: 3, gradient: 'linear-gradient(135deg, #A78BFA, #F472B6)' },
  { id: 'clothes', emoji: '👕', titleHe: 'בגדים', titleEn: 'Clothes', level: 3, gradient: 'linear-gradient(135deg, #FB7185, #FBBF24)' },
  { id: 'transport', emoji: '🚗', titleHe: 'תחבורה', titleEn: 'Transport', level: 3, gradient: 'linear-gradient(135deg, #2DD4BF, #3B82F6)' },
  { id: 'nature', emoji: '🌳', titleHe: 'טבע', titleEn: 'Nature', level: 3, gradient: 'linear-gradient(135deg, #22C55E, #14B8A6)' },
  { id: 'daily_routine', emoji: '⏰', titleHe: 'שגרה יומית', titleEn: 'Daily Routine', level: 4, gradient: 'linear-gradient(135deg, #F59E0B, #EC4899)' },
  { id: 'store', emoji: '🛍️', titleHe: 'חנות', titleEn: 'Store', level: 4, gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' },
  { id: 'hobbies', emoji: '🎯', titleHe: 'תחביבים', titleEn: 'Hobbies', level: 4, gradient: 'linear-gradient(135deg, #EF4444, #F97316)' },
  { id: 'verbs', emoji: '🏃', titleHe: 'פעלים', titleEn: 'Verbs', level: 4, gradient: 'linear-gradient(135deg, #6366F1, #22C55E)' },
];

const TOPIC_WORDS = {
  colors: [
    { word: 'Red', emoji: '🔴', translation: 'אדום' }, { word: 'Blue', emoji: '🔵', translation: 'כחול' },
    { word: 'Green', emoji: '🟢', translation: 'ירוק' }, { word: 'Yellow', emoji: '🟡', translation: 'צהוב' },
    { word: 'Purple', emoji: '🟣', translation: 'סגול' }, { word: 'Orange', emoji: '🟠', translation: 'כתום' },
    { word: 'Pink', emoji: '🩷', translation: 'ורוד' }, { word: 'White', emoji: '⬜', translation: 'לבן' },
    { word: 'Black', emoji: '⬛', translation: 'שחור' }, { word: 'Brown', emoji: '🟤', translation: 'חום' },
  ],
  animals: [
    { word: 'Dog', emoji: '🐕', translation: 'כלב' }, { word: 'Cat', emoji: '🐈', translation: 'חתול' },
    { word: 'Bird', emoji: '🐦', translation: 'ציפור' }, { word: 'Fish', emoji: '🐟', translation: 'דג' },
    { word: 'Horse', emoji: '🐴', translation: 'סוס' }, { word: 'Cow', emoji: '🐄', translation: 'פרה' },
    { word: 'Lion', emoji: '🦁', translation: 'אריה' }, { word: 'Elephant', emoji: '🐘', translation: 'פיל' },
    { word: 'Rabbit', emoji: '🐰', translation: 'ארנב' }, { word: 'Bear', emoji: '🐻', translation: 'דוב' },
  ],
  numbers: [
    { word: 'One', emoji: '1️⃣', translation: 'אחד' }, { word: 'Two', emoji: '2️⃣', translation: 'שניים' },
    { word: 'Three', emoji: '3️⃣', translation: 'שלושה' }, { word: 'Four', emoji: '4️⃣', translation: 'ארבעה' },
    { word: 'Five', emoji: '5️⃣', translation: 'חמישה' }, { word: 'Six', emoji: '6️⃣', translation: 'שישה' },
    { word: 'Seven', emoji: '7️⃣', translation: 'שבעה' }, { word: 'Eight', emoji: '8️⃣', translation: 'שמונה' },
    { word: 'Nine', emoji: '9️⃣', translation: 'תשעה' }, { word: 'Ten', emoji: '🔟', translation: 'עשרה' },
  ],
  fruits: [
    { word: 'Apple', emoji: '🍎', translation: 'תפוח' }, { word: 'Banana', emoji: '🍌', translation: 'בננה' },
    { word: 'Orange', emoji: '🍊', translation: 'תפוז' }, { word: 'Grape', emoji: '🍇', translation: 'ענב' },
    { word: 'Strawberry', emoji: '🍓', translation: 'תות' }, { word: 'Watermelon', emoji: '🍉', translation: 'אבטיח' },
    { word: 'Pineapple', emoji: '🍍', translation: 'אננס' }, { word: 'Cherry', emoji: '🍒', translation: 'דובדבן' },
    { word: 'Peach', emoji: '🍑', translation: 'אפרסק' }, { word: 'Lemon', emoji: '🍋', translation: 'לימון' },
  ],
  greetings: [
    { word: 'Hello', emoji: '👋', translation: 'שלום' }, { word: 'Goodbye', emoji: '👋', translation: 'להתראות' },
    { word: 'Thank you', emoji: '🙏', translation: 'תודה' }, { word: 'Please', emoji: '🤲', translation: 'בבקשה' },
    { word: 'Yes', emoji: '✅', translation: 'כן' }, { word: 'No', emoji: '❌', translation: 'לא' },
    { word: 'Good morning', emoji: '🌅', translation: 'בוקר טוב' }, { word: 'Good night', emoji: '🌙', translation: 'לילה טוב' },
    { word: 'How are you?', emoji: '😊', translation: 'מה שלומך?' }, { word: 'My name is', emoji: '🏷️', translation: 'קוראים לי' },
  ],
  family: [
    { word: 'Mother', emoji: '👩', translation: 'אמא' }, { word: 'Father', emoji: '👨', translation: 'אבא' },
    { word: 'Brother', emoji: '👦', translation: 'אח' }, { word: 'Sister', emoji: '👧', translation: 'אחות' },
    { word: 'Baby', emoji: '👶', translation: 'תינוק' }, { word: 'Grandmother', emoji: '👵', translation: 'סבתא' },
    { word: 'Grandfather', emoji: '👴', translation: 'סבא' }, { word: 'Family', emoji: '👨‍👩‍👧‍👦', translation: 'משפחה' },
    { word: 'Uncle', emoji: '👨', translation: 'דוד' }, { word: 'Aunt', emoji: '👩', translation: 'דודה' },
  ],
  body: [
    { word: 'Head', emoji: '😀', translation: 'ראש' }, { word: 'Hand', emoji: '✋', translation: 'יד' },
    { word: 'Eye', emoji: '👁️', translation: 'עין' }, { word: 'Nose', emoji: '👃', translation: 'אף' },
    { word: 'Mouth', emoji: '👄', translation: 'פה' }, { word: 'Ear', emoji: '👂', translation: 'אוזן' },
    { word: 'Foot', emoji: '🦶', translation: 'רגל' }, { word: 'Hair', emoji: '💇', translation: 'שיער' },
    { word: 'Heart', emoji: '❤️', translation: 'לב' }, { word: 'Teeth', emoji: '🦷', translation: 'שיניים' },
  ],
  classroom: [
    { word: 'Book', emoji: '📖', translation: 'ספר' }, { word: 'Pencil', emoji: '✏️', translation: 'עיפרון' },
    { word: 'Teacher', emoji: '👩‍🏫', translation: 'מורה' }, { word: 'School', emoji: '🏫', translation: 'בית ספר' },
    { word: 'Table', emoji: '🪑', translation: 'שולחן' }, { word: 'Chair', emoji: '💺', translation: 'כיסא' },
    { word: 'Bag', emoji: '🎒', translation: 'תיק' }, { word: 'Clock', emoji: '🕐', translation: 'שעון' },
    { word: 'Paper', emoji: '📄', translation: 'נייר' }, { word: 'Color', emoji: '🎨', translation: 'צבע' },
  ],
  food: [
    { word: 'Bread', emoji: '🍞', translation: 'לחם' }, { word: 'Milk', emoji: '🥛', translation: 'חלב' },
    { word: 'Egg', emoji: '🥚', translation: 'ביצה' }, { word: 'Rice', emoji: '🍚', translation: 'אורז' },
    { word: 'Pizza', emoji: '🍕', translation: 'פיצה' }, { word: 'Ice cream', emoji: '🍦', translation: 'גלידה' },
    { word: 'Cake', emoji: '🎂', translation: 'עוגה' }, { word: 'Water', emoji: '💧', translation: 'מים' },
    { word: 'Juice', emoji: '🧃', translation: 'מיץ' }, { word: 'Cookie', emoji: '🍪', translation: 'עוגיה' },
  ],
  sizes: [
    { word: 'Big', emoji: '🐘', translation: 'גדול' }, { word: 'Small', emoji: '🐜', translation: 'קטן' },
    { word: 'Tall', emoji: '🦒', translation: 'גבוה' }, { word: 'Short', emoji: '🐁', translation: 'נמוך' },
    { word: 'Long', emoji: '🐍', translation: 'ארוך' }, { word: 'Fast', emoji: '🐆', translation: 'מהיר' },
    { word: 'Slow', emoji: '🐢', translation: 'איטי' }, { word: 'Heavy', emoji: '🏋️', translation: 'כבד' },
    { word: 'Light', emoji: '🪶', translation: 'קל' }, { word: 'Wide', emoji: '↔️', translation: 'רחב' },
  ],
  weather: [
    { word: 'Sun', emoji: '☀️', translation: 'שמש' }, { word: 'Rain', emoji: '🌧️', translation: 'גשם' },
    { word: 'Cloud', emoji: '☁️', translation: 'ענן' }, { word: 'Snow', emoji: '❄️', translation: 'שלג' },
    { word: 'Wind', emoji: '💨', translation: 'רוח' }, { word: 'Hot', emoji: '🔥', translation: 'חם' },
    { word: 'Cold', emoji: '🥶', translation: 'קר' }, { word: 'Rainbow', emoji: '🌈', translation: 'קשת' },
    { word: 'Star', emoji: '⭐', translation: 'כוכב' }, { word: 'Moon', emoji: '🌙', translation: 'ירח' },
  ],
  home: [
    { word: 'House', emoji: '🏠', translation: 'בית' }, { word: 'Door', emoji: '🚪', translation: 'דלת' },
    { word: 'Window', emoji: '🪟', translation: 'חלון' }, { word: 'Bed', emoji: '🛏️', translation: 'מיטה' },
    { word: 'Kitchen', emoji: '🍳', translation: 'מטבח' }, { word: 'Garden', emoji: '🌳', translation: 'גינה' },
    { word: 'Key', emoji: '🔑', translation: 'מפתח' }, { word: 'Light', emoji: '💡', translation: 'אור' },
    { word: 'Bathroom', emoji: '🚿', translation: 'חדר אמבטיה' }, { word: 'Television', emoji: '📺', translation: 'טלוויזיה' },
  ],
  clothes: [
    { word: 'Shirt', emoji: '👕', translation: 'חולצה' }, { word: 'Pants', emoji: '👖', translation: 'מכנסיים' },
    { word: 'Shoes', emoji: '👟', translation: 'נעליים' }, { word: 'Hat', emoji: '🧢', translation: 'כובע' },
    { word: 'Dress', emoji: '👗', translation: 'שמלה' }, { word: 'Socks', emoji: '🧦', translation: 'גרביים' },
    { word: 'Jacket', emoji: '🧥', translation: "ז'קט" }, { word: 'Scarf', emoji: '🧣', translation: 'צעיף' },
    { word: 'Glasses', emoji: '👓', translation: 'משקפיים' }, { word: 'Watch', emoji: '⌚', translation: 'שעון יד' },
  ],
  transport: [
    { word: 'Car', emoji: '🚗', translation: 'מכונית' }, { word: 'Bus', emoji: '🚌', translation: 'אוטובוס' },
    { word: 'Train', emoji: '🚂', translation: 'רכבת' }, { word: 'Airplane', emoji: '✈️', translation: 'מטוס' },
    { word: 'Bicycle', emoji: '🚲', translation: 'אופניים' }, { word: 'Ship', emoji: '🚢', translation: 'ספינה' },
    { word: 'Helicopter', emoji: '🚁', translation: 'מסוק' }, { word: 'Truck', emoji: '🚛', translation: 'משאית' },
    { word: 'Motorcycle', emoji: '🏍️', translation: 'אופנוע' }, { word: 'Taxi', emoji: '🚕', translation: 'מונית' },
  ],
  nature: [
    { word: 'Tree', emoji: '🌳', translation: 'עץ' }, { word: 'Flower', emoji: '🌸', translation: 'פרח' },
    { word: 'Mountain', emoji: '🏔️', translation: 'הר' }, { word: 'Sea', emoji: '🌊', translation: 'ים' },
    { word: 'River', emoji: '🏞️', translation: 'נהר' }, { word: 'Forest', emoji: '🌲', translation: 'יער' },
    { word: 'Desert', emoji: '🏜️', translation: 'מדבר' }, { word: 'Lake', emoji: '🏞️', translation: 'אגם' },
    { word: 'Sky', emoji: '🌤️', translation: 'שמיים' }, { word: 'Rock', emoji: '🪨', translation: 'סלע' },
  ],
  daily_routine: [
    { word: 'Wake up', emoji: '⏰', translation: 'להתעורר' }, { word: 'Eat', emoji: '🍽️', translation: 'לאכול' },
    { word: 'Drink', emoji: '🥤', translation: 'לשתות' }, { word: 'Sleep', emoji: '😴', translation: 'לישון' },
    { word: 'Play', emoji: '🎮', translation: 'לשחק' }, { word: 'Read', emoji: '📖', translation: 'לקרוא' },
    { word: 'Write', emoji: '✍️', translation: 'לכתוב' }, { word: 'Run', emoji: '🏃', translation: 'לרוץ' },
    { word: 'Walk', emoji: '🚶', translation: 'ללכת' }, { word: 'Sing', emoji: '🎤', translation: 'לשיר' },
  ],
  store: [
    { word: 'Money', emoji: '💰', translation: 'כסף' }, { word: 'Price', emoji: '🏷️', translation: 'מחיר' },
    { word: 'Buy', emoji: '🛒', translation: 'לקנות' }, { word: 'Shop', emoji: '🏪', translation: 'חנות' },
    { word: 'Gift', emoji: '🎁', translation: 'מתנה' }, { word: 'Toy', emoji: '🧸', translation: 'צעצוע' },
    { word: 'Candy', emoji: '🍬', translation: 'סוכרייה' }, { word: 'Chocolate', emoji: '🍫', translation: 'שוקולד' },
    { word: 'Bag', emoji: '🛍️', translation: 'שקית' }, { word: 'Sell', emoji: '💵', translation: 'למכור' },
  ],
  hobbies: [
    { word: 'Draw', emoji: '🎨', translation: 'לצייר' }, { word: 'Dance', emoji: '💃', translation: 'לרקוד' },
    { word: 'Swim', emoji: '🏊', translation: 'לשחות' }, { word: 'Cook', emoji: '👨‍🍳', translation: 'לבשל' },
    { word: 'Music', emoji: '🎵', translation: 'מוזיקה' }, { word: 'Soccer', emoji: '⚽', translation: 'כדורגל' },
    { word: 'Basketball', emoji: '🏀', translation: 'כדורסל' }, { word: 'Tennis', emoji: '🎾', translation: 'טניס' },
    { word: 'Photo', emoji: '📸', translation: 'צילום' }, { word: 'Game', emoji: '🎲', translation: 'משחק' },
  ],
  verbs: [
    { word: 'Go', emoji: '🚶', translation: 'ללכת' }, { word: 'Come', emoji: '🏃', translation: 'לבוא' },
    { word: 'See', emoji: '👀', translation: 'לראות' }, { word: 'Hear', emoji: '👂', translation: 'לשמוע' },
    { word: 'Talk', emoji: '🗣️', translation: 'לדבר' }, { word: 'Think', emoji: '🤔', translation: 'לחשוב' },
    { word: 'Love', emoji: '❤️', translation: 'לאהוב' }, { word: 'Want', emoji: '🤞', translation: 'לרצות' },
    { word: 'Know', emoji: '🧠', translation: 'לדעת' }, { word: 'Make', emoji: '🔨', translation: 'לעשות' },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateExercises(topicId) {
  const words = TOPIC_WORDS[topicId] || TOPIC_WORDS.colors;
  const exercises = [];
  const shuffled = shuffle(words);
  const types = shuffle(['emoji-pick','word-to-hebrew','listen-pick','fill-letter','emoji-pick','word-to-hebrew','speak-word','listen-pick']);
  for (let i = 0; i < 8; i++) {
    const target = shuffled[i % shuffled.length];
    const distractors = shuffle(words.filter(w => w.word !== target.word)).slice(0, 3);
    const type = types[i];
    if (type === 'emoji-pick') {
      exercises.push({ type, question: target.word, correctAnswer: target.emoji,
        options: shuffle([target, ...distractors]).map(w => ({ emoji: w.emoji, word: w.word })), wordData: target });
    } else if (type === 'word-to-hebrew') {
      exercises.push({ type, question: target.word, correctAnswer: target.translation,
        options: shuffle([target, ...distractors]).map(w => w.translation), wordData: target });
    } else if (type === 'listen-pick') {
      exercises.push({ type, question: target.word, correctAnswer: target.word,
        options: shuffle([target, ...distractors]).map(w => w.word), wordData: target });
    } else if (type === 'fill-letter') {
      const idx = Math.floor(Math.random() * target.word.length);
      const hidden = target.word[idx];
      const display = target.word.substring(0, idx) + '_' + target.word.substring(idx + 1);
      const letters = shuffle([hidden.toLowerCase(), ...shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(l => l !== hidden.toLowerCase())).slice(0, 3)]);
      exercises.push({ type, question: display, fullWord: target.word, correctAnswer: hidden.toLowerCase(),
        options: letters, emoji: target.emoji, wordData: target });
    } else if (type === 'speak-word') {
      exercises.push({ type, question: target.word, emoji: target.emoji,
        correctAnswer: target.word.toLowerCase(), wordData: target });
    } else {
      exercises.push({ type: 'emoji-pick', question: target.word, correctAnswer: target.emoji,
        options: shuffle([target, ...distractors]).map(w => ({ emoji: w.emoji, word: w.word })), wordData: target });
    }
  }
  return exercises;
}

export default function KidsTeacherPage({ onBack }) {
  const { uiLang } = useTheme();
  const { addXP, progress: userProgress } = useUserProgress();
  const { speak, speakSequence } = useSpeech();
  const { speakWordPair } = useSpeechSynthesis();
  const isRTL = RTL_LANGS.includes(uiLang);

  const [phase, setPhase] = useState('topic-select');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);
  const [streak, setStreak] = useState(0);
  const [teacherState, setTeacherState] = useState('idle');
  const [speechText, setSpeechText] = useState('');
  const [showSpeech, setShowSpeech] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const correctCountRef = useRef(0);
  const currentExRef = useRef(0);
  const exerciseTimersRef = useRef([]);

  // Sync refs
  useEffect(() => { currentExRef.current = currentExIndex; }, [currentExIndex]);

  // Stop all audio + clear timers on unmount
  useEffect(() => () => { stopAllAudio(); exerciseTimersRef.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    setSpeechText(t('teacherGreeting', uiLang));
    // Only speak greeting if KidsIntro popup was already seen (otherwise KidsIntro handles speech)
    try {
      const seen = JSON.parse(sessionStorage.getItem('kids-intro-seen') || '[]');
      if (seen.includes('kids-teacher-v1')) {
        speak(t('teacherGreeting', uiLang), { lang: uiLang });
      }
    } catch (e) {}
  }, []);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setExercises(generateExercises(topic.id));
    setPhase('intro');
    setTeacherState('talking');
    const topicName = isRTL ? topic.titleHe : topic.titleEn;
    setSpeechText(`${t('todayWeLearn', uiLang)} ${topicName}! ${t('ready', uiLang)}`);
    speak(`Today we will learn about ${topic.titleEn}! Ready?`, { lang: 'en-US' });
  };

  const startExercises = () => {
    setPhase('exercise');
    setCurrentExIndex(0);
    setCorrectWords([]);
    setWrongWords([]);
    setStreak(0);
    correctCountRef.current = 0;
    setTeacherState('idle');
    setShowSpeech(false);
  };

  const handleAnswer = (isCorrect, wordData) => {
    if (isCorrect) {
      setCorrectWords(prev => [...prev, wordData]);
      correctCountRef.current += 1;
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak >= 5) { setSpeechText(t('youAreAStar', uiLang)); }
        else if (newStreak >= 3) { setSpeechText(t('threeInRow', uiLang)); }
        else { setSpeechText(t('correct', uiLang)); }
        return newStreak;
      });
      setTeacherState('happy');
      playCorrect();
      setShowSpeech(true);
    } else {
      setWrongWords(prev => [...prev, wordData]);
      setStreak(0);
      setTeacherState('encouraging');
      playWrong();
      setSpeechText(t('itsOkay', uiLang));
      setShowSpeech(true);
    }

    const t1 = setTimeout(() => {
      const nextIdx = currentExRef.current + 1;
      if (nextIdx >= exercises.length) {
        setPhase('complete');
        setTeacherState('celebrating');
        playComplete();
        const score = correctCountRef.current;
        setSpeechText(score === exercises.length ? t('perfectScore', uiLang) : t('lessonComplete', uiLang));
        setShowSpeech(true);
        setShowConfetti(true);
        if (addXP) addXP(10 + score * 5, 'kids-teacher').catch(() => {});
      } else {
        setCurrentExIndex(nextIdx);
        setTeacherState('idle');
        setShowSpeech(false);
        if (nextIdx === exercises.length - 1) {
          const t2 = setTimeout(() => { setSpeechText(t('lastExercise', uiLang)); setShowSpeech(true); }, 300);
          exerciseTimersRef.current.push(t2);
        }
      }
    }, 900);
    exerciseTimersRef.current.push(t1);
  };

  const goBack = () => { stopAllAudio(); if (onBack) onBack(); };

  // ── TOPIC SELECT ──
  if (phase === 'topic-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 pb-24">
        <KidsIntro
          id="kids-teacher-v1"
          name={userProgress.displayName}
          emoji="📝"
          title="Practice with Speakli!"
          titleHe="תרגול עם ספיקלי!"
          desc="Hi! Let's practice English together! Let's start!"
          descHe="היי! בואו נתרגל יחד אנגלית! בואו נתחיל!"
          uiLang={uiLang}
          gradient="from-purple-500 via-violet-500 to-fuchsia-500"
          buttonLabel="Let's practice!"
          buttonLabelHe="בואו נתרגל!"
        />
        <div className="flex items-center gap-3 mb-4" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <button onClick={goBack} className="glass-card w-10 h-10 rounded-xl flex items-center justify-center text-xl">{isRTL ? '→' : '←'}</button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('teacherTime', uiLang)}</h1>
        </div>
        <div className="flex flex-col items-center mb-5">
          <TeacherCharacter state={teacherState} size="normal" />
          <SpeechBubble text={speechText} direction={isRTL ? 'rtl' : 'ltr'} visible={showSpeech} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEACHER_TOPICS.map(topic => (
            <button key={topic.id} onClick={() => handleTopicSelect(topic)}
              className="rounded-2xl p-4 flex flex-col items-center gap-1 active:scale-95 transition-transform shadow-lg"
              style={{ background: topic.gradient }}>
              <span className="text-3xl">{topic.emoji}</span>
              <span className="text-sm font-bold text-white drop-shadow">{isRTL ? topic.titleHe : topic.titleEn}</span>
              <span className="text-xs text-white/80">Level {topic.level}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-5">
        <TeacherCharacter state="talking" size="normal" />
        <SpeechBubble text={speechText} direction={isRTL ? 'rtl' : 'ltr'} />
        <div className="mt-8 rounded-3xl p-6 text-center shadow-xl animate-pop-in" style={{ background: selectedTopic.gradient }}>
          <div className="text-5xl">{selectedTopic.emoji}</div>
          <div className="text-xl font-bold text-white drop-shadow mt-2">{isRTL ? selectedTopic.titleHe : selectedTopic.titleEn}</div>
        </div>
        <button onClick={startExercises}
          className="mt-8 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold text-lg px-8 py-3 rounded-2xl shadow-lg active:scale-95 transition-transform">
          {t('letsStart', uiLang)}
        </button>
      </div>
    );
  }

  // ── EXERCISE ──
  if (phase === 'exercise') {
    const ex = exercises[currentExIndex];
    if (!ex) return null;
    const progress = (currentExIndex / exercises.length) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="flex items-center gap-3 mb-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <button onClick={goBack} className="glass-card w-9 h-9 rounded-lg flex items-center justify-center text-lg">✕</button>
          <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{currentExIndex + 1}/{exercises.length}</span>
          {streak >= 3 && <span className="text-lg" style={{ animation: 'jelly 0.5s ease' }}>🔥{streak}</span>}
        </div>
        <div className="flex justify-end items-start gap-2 mb-2">
          <div className="flex flex-col items-center">
            <TeacherCharacter state={teacherState} size="small" />
            {showSpeech && speechText && (
              <div className="glass-card rounded-lg px-2 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 max-w-[140px] text-center -mt-1">{speechText}</div>
            )}
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6 shadow-lg">
          <ExerciseRenderer key={currentExIndex} exercise={ex} onAnswer={handleAnswer} t={t} uiLang={uiLang} speak={speak} speakWordPair={speakWordPair} />
        </div>
      </div>
    );
  }

  // ── COMPLETE ──
  if (phase === 'complete') {
    const total = correctWords.length + wrongWords.length;
    const stars = Math.min(4, Math.ceil((correctWords.length / Math.max(total, 1)) * 4));
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-5 relative overflow-hidden">
        {showConfetti && <ConfettiExplosion />}
        <TeacherCharacter state="celebrating" size="normal" />
        <SpeechBubble text={speechText} direction={isRTL ? 'rtl' : 'ltr'} />
        <div className="flex gap-2 mt-5">
          {[1,2,3,4].map(i => (
            <span key={i} className="text-4xl" style={{ filter: i <= stars ? 'none' : 'grayscale(1) opacity(0.3)', animation: i <= stars ? `popIn 0.3s ease ${i * 0.15}s both` : 'none' }}>⭐</span>
          ))}
        </div>
        <div className="text-base font-semibold text-gray-500 dark:text-gray-400 mt-2">{correctWords.length}/{total} {t('correct', uiLang)}</div>
        <div className="glass-card rounded-2xl p-4 mt-4 w-full max-w-xs shadow-lg">
          <div className="font-bold text-gray-800 dark:text-white text-sm mb-2" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>{t('wordsLearned', uiLang)}</div>
          <div className="flex flex-wrap gap-1.5">
            {[...correctWords, ...wrongWords].map((w, i) => {
              const ok = correctWords.includes(w);
              return (
                <button key={i} onClick={() => speakWordPair(w.word, w.translation)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1 ${ok ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                  🔊 {w.emoji} {w.word} {ok ? '✅' : '❌'}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-3 mt-5" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <button onClick={() => { setPhase('topic-select'); setTeacherState('idle'); setSpeechText(t('teacherGreeting', uiLang)); setShowSpeech(true); setShowConfetti(false); }}
            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition-transform">
            {t('anotherLesson', uiLang)}
          </button>
          <button onClick={goBack}
            className="glass-card font-bold px-6 py-3 rounded-2xl text-gray-600 dark:text-gray-300 active:scale-95 transition-transform">
            {t('backToHome', uiLang)}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
