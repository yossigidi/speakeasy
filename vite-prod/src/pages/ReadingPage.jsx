import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Clock, Volume2, VolumeX, ArrowLeft, Plus, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import useSpacedRepetition from '../hooks/useSpacedRepetition.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import AnimatedButton from '../components/shared/AnimatedButton.jsx';
import Modal from '../components/shared/Modal.jsx';

const STORIES = [
  {
    id: 's1', level: 'A1', topic: 'Daily Life', topicHe: 'חיי יומיום',
    title: 'My Morning', titleHe: 'הבוקר שלי', readTime: 2,
    text: `Every morning, I wake up at seven o'clock. I brush my teeth and wash my face. Then I go to the kitchen and make breakfast. I usually eat toast with butter and drink a cup of coffee. After breakfast, I get dressed and go to work. I take the bus because my office is far from my house. The bus ride takes about thirty minutes. I like to listen to music on the bus.`,
    vocabulary: [
      { word: 'wake up', translation: 'להתעורר', definition: 'To stop sleeping' },
      { word: 'brush', translation: 'לצחצח', definition: 'To clean with a brush' },
      { word: 'kitchen', translation: 'מטבח', definition: 'Room where you cook food' },
      { word: 'usually', translation: 'בדרך כלל', definition: 'Most of the time' },
      { word: 'office', translation: 'משרד', definition: 'Place where you work' },
    ],
    questions: [
      { question: 'What time does the person wake up?', options: ['6:00', '7:00', '8:00', '9:00'], correct: 1 },
      { question: 'What does the person eat for breakfast?', options: ['Cereal', 'Toast with butter', 'Eggs', 'Fruit'], correct: 1 },
      { question: 'How does the person go to work?', options: ['By car', 'By train', 'By bus', 'On foot'], correct: 2 },
    ]
  },
  {
    id: 's2', level: 'A1', topic: 'Shopping', topicHe: 'קניות',
    title: 'At the Supermarket', titleHe: 'בסופרמרקט', readTime: 2,
    text: `Today I need to go to the supermarket. I have a shopping list. I need to buy milk, bread, eggs, and vegetables. The supermarket is near my house, so I can walk there. When I arrive, I take a shopping cart. First, I go to the fruit and vegetable section. I choose some tomatoes, cucumbers, and apples. Then I go to the dairy section for milk and cheese. Finally, I pay at the checkout and walk home.`,
    vocabulary: [
      { word: 'shopping list', translation: 'רשימת קניות', definition: 'A list of things to buy' },
      { word: 'supermarket', translation: 'סופרמרקט', definition: 'A large store that sells food' },
      { word: 'shopping cart', translation: 'עגלת קניות', definition: 'A cart for carrying items in a store' },
      { word: 'section', translation: 'מחלקה', definition: 'A part of something' },
      { word: 'checkout', translation: 'קופה', definition: 'The place where you pay in a store' },
    ],
    questions: [
      { question: 'How does the person get to the supermarket?', options: ['By car', 'By bus', 'Walking', 'By bicycle'], correct: 2 },
      { question: 'What section does the person visit first?', options: ['Dairy', 'Meat', 'Fruit and vegetables', 'Bakery'], correct: 2 },
      { question: 'What is NOT on the shopping list?', options: ['Milk', 'Bread', 'Rice', 'Eggs'], correct: 2 },
    ]
  },
  {
    id: 's3', level: 'A2', topic: 'Travel', topicHe: 'טיולים',
    title: 'A Weekend Trip', titleHe: 'טיול סוף שבוע', readTime: 3,
    text: `Last weekend, my friend Sarah and I decided to take a short trip to the beach. We left early in the morning and drove for two hours. The weather was perfect - sunny and warm. When we arrived, we found a nice spot near the water. We swam in the sea and built sandcastles. For lunch, we ate fish and chips at a small restaurant by the beach. In the afternoon, we walked along the shore and collected seashells. We took many beautiful photos. We drove home in the evening, tired but happy. It was a wonderful day!`,
    vocabulary: [
      { word: 'decided', translation: 'החלטנו', definition: 'Made a choice' },
      { word: 'perfect', translation: 'מושלם', definition: 'Completely good' },
      { word: 'sandcastles', translation: 'ארמונות חול', definition: 'Structures made of sand on the beach' },
      { word: 'shore', translation: 'חוף', definition: 'The edge of land next to the sea' },
      { word: 'seashells', translation: 'צדפים', definition: 'Hard shells found on the beach' },
    ],
    questions: [
      { question: 'How long was the drive to the beach?', options: ['One hour', 'Two hours', 'Three hours', 'Thirty minutes'], correct: 1 },
      { question: 'What did they eat for lunch?', options: ['Pizza', 'Sandwiches', 'Fish and chips', 'Salad'], correct: 2 },
      { question: 'How did they feel when they drove home?', options: ['Sad', 'Angry', 'Tired but happy', 'Bored'], correct: 2 },
    ]
  },
  {
    id: 's4', level: 'A2', topic: 'Work', topicHe: 'עבודה',
    title: 'My New Job', titleHe: 'העבודה החדשה שלי', readTime: 3,
    text: `I started a new job last month. I work as a software developer at a technology company. My office is in a modern building in the city center. I work from Monday to Friday, from nine to five. My colleagues are very friendly and helpful. My manager, Tom, explains things clearly and is always patient. Every morning, we have a team meeting to discuss our tasks for the day. I really enjoy my work because I love solving problems with code. The company also has a nice cafeteria where I eat lunch every day. I am learning many new things and I am very happy with my new job.`,
    vocabulary: [
      { word: 'software developer', translation: 'מפתח תוכנה', definition: 'Someone who writes computer programs' },
      { word: 'colleagues', translation: 'עמיתים', definition: 'People you work with' },
      { word: 'patient', translation: 'סבלני', definition: 'Able to wait without getting upset' },
      { word: 'discuss', translation: 'לדון', definition: 'To talk about something' },
      { word: 'cafeteria', translation: 'קפיטריה', definition: 'A place to eat in a building' },
    ],
    questions: [
      { question: 'When did the person start the new job?', options: ['Last week', 'Last month', 'Last year', 'Yesterday'], correct: 1 },
      { question: 'What does the team do every morning?', options: ['Exercise', 'Have a meeting', 'Eat breakfast', 'Read emails'], correct: 1 },
      { question: 'Why does the person enjoy the work?', options: ['Good salary', 'Short hours', 'Loves solving problems', 'Near home'], correct: 2 },
    ]
  },
  {
    id: 's5', level: 'B1', topic: 'Environment', topicHe: 'סביבה',
    title: 'Saving Our Planet', titleHe: 'להציל את כדור הארץ', readTime: 4,
    text: `Climate change is one of the biggest challenges facing our world today. Every year, temperatures are rising and extreme weather events are becoming more common. Scientists say that human activities, especially burning fossil fuels, are the main cause of this problem. However, there are many things we can do to help. We can reduce our carbon footprint by using public transportation instead of driving, eating less meat, and saving energy at home. Recycling and reducing waste are also important steps. Many countries are now investing in renewable energy sources like solar and wind power. Young people around the world are organizing protests and demanding action from their governments. While the situation is serious, experts believe that if we act quickly, we can still make a difference. Every small action counts, and together we can create a more sustainable future for the next generations.`,
    vocabulary: [
      { word: 'climate change', translation: 'שינוי אקלים', definition: 'Long-term changes in global temperatures' },
      { word: 'carbon footprint', translation: 'טביעת פחמן', definition: 'The amount of CO2 produced by activities' },
      { word: 'renewable energy', translation: 'אנרגיה מתחדשת', definition: 'Energy from sources that are not depleted' },
      { word: 'sustainable', translation: 'בר-קיימא', definition: 'Able to continue without damaging the environment' },
      { word: 'fossil fuels', translation: 'דלקי מאובנים', definition: 'Coal, oil, and natural gas' },
    ],
    questions: [
      { question: 'What do scientists say is the main cause of climate change?', options: ['Natural cycles', 'Human activities', 'Solar energy', 'Volcanoes'], correct: 1 },
      { question: 'What type of energy is mentioned as a solution?', options: ['Nuclear', 'Fossil fuels', 'Solar and wind', 'Coal'], correct: 2 },
      { question: 'What is the tone of the passage about the future?', options: ['Completely hopeless', 'Cautiously optimistic', 'Very excited', 'Indifferent'], correct: 1 },
    ]
  },
];

function StoryCard({ story, onClick }) {
  const { uiLang } = useTheme();

  return (
    <GlassCard className="cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center flex-shrink-0">
          <BookOpen size={22} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              story.level === 'A1' ? 'bg-green-100 text-green-700' :
              story.level === 'A2' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>{story.level}</span>
            <span className="text-xs text-gray-400">{uiLang === 'he' ? story.topicHe : story.topic}</span>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white truncate">
            {uiLang === 'he' ? story.titleHe : story.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <Clock size={12} /> {story.readTime} {t('min', uiLang)}
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400 mt-3" />
      </div>
    </GlassCard>
  );
}

function ReadingView({ story, onBack }) {
  const { uiLang } = useTheme();
  const { addXP } = useUserProgress();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const { addWord } = useSpacedRepetition();
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  const toggleReadAloud = useCallback(() => {
    if (isReadingAloud) {
      stop();
      setIsReadingAloud(false);
    } else {
      stop(); // ensure any previous audio is fully stopped
      setIsReadingAloud(true);
      speak(story.text, {
        onEnd: () => setIsReadingAloud(false),
      });
    }
  }, [isReadingAloud, speak, stop, story.text]);

  // Stop audio when leaving the story
  useEffect(() => {
    return () => stop();
  }, [stop]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);

  const words = story.text.split(/(\s+)/);

  const handleWordClick = (word) => {
    const clean = word.replace(/[^\w']/g, '').toLowerCase();
    const vocab = story.vocabulary.find(v => v.word.toLowerCase() === clean || v.word.toLowerCase().includes(clean));
    if (vocab) setSelectedWord(vocab);
  };

  const handleQuizAnswer = (idx) => {
    if (quizAnswered) return;
    setSelectedQuizAnswer(idx);
    setQuizAnswered(true);
    if (idx === story.questions[quizIndex].correct) {
      setQuizCorrect(c => c + 1);
    }
  };

  const nextQuestion = () => {
    if (quizIndex + 1 >= story.questions.length) {
      setQuizDone(true);
      addXP(20, 'reading');
    } else {
      setQuizIndex(quizIndex + 1);
      setQuizAnswered(false);
      setSelectedQuizAnswer(null);
    }
  };

  if (showQuiz) {
    if (quizDone) {
      return (
        <div className="pb-24 px-4 pt-4 flex flex-col items-center justify-center min-h-[60vh]">
          <span className="text-5xl mb-4">📚</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('comprehension', uiLang)}
          </h2>
          <p className="text-3xl font-bold gradient-text mb-4">
            {quizCorrect}/{story.questions.length}
          </p>
          <AnimatedButton onClick={onBack}>{t('done', uiLang)}</AnimatedButton>
        </div>
      );
    }

    const q = story.questions[quizIndex];
    return (
      <div className="pb-24 px-4 pt-4 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowQuiz(false)} className="p-1.5 rounded-lg hover:bg-black/5">
            <ArrowLeft size={20} className={uiLang === 'he' ? 'rotate-180' : ''} />
          </button>
          <span className="text-sm text-gray-500">{quizIndex + 1}/{story.questions.length}</span>
        </div>
        <GlassCard variant="strong">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{q.question}</h3>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleQuizAnswer(i)}
                className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all border-2 ${
                  quizAnswered
                    ? i === q.correct ? 'bg-emerald-100 border-emerald-500' : i === selectedQuizAnswer ? 'bg-red-100 border-red-500' : 'bg-gray-50 border-transparent'
                    : selectedQuizAnswer === i ? 'bg-brand-50 border-brand-500' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                {opt}
              </button>
            ))}
          </div>
          {quizAnswered && (
            <AnimatedButton onClick={nextQuestion} size="full" className="mt-4">{t('continue', uiLang)}</AnimatedButton>
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft size={20} className={uiLang === 'he' ? 'rotate-180' : ''} />
        </button>
        <button onClick={toggleReadAloud} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
          isReadingAloud
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
            : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600'
        }`}>
          {isReadingAloud ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {isReadingAloud
            ? (uiLang === 'he' ? 'עצור' : 'Stop')
            : t('listenToStory', uiLang)}
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{story.title}</h2>

      <GlassCard variant="strong" className="leading-relaxed">
        <p className="text-gray-800 dark:text-gray-200">
          {words.map((word, i) => {
            const clean = word.replace(/[^\w']/g, '').toLowerCase();
            const isVocab = story.vocabulary.some(v => v.word.toLowerCase().includes(clean) && clean.length > 2);
            return (
              <span
                key={i}
                onClick={() => handleWordClick(word)}
                className={`${isVocab ? 'underline decoration-brand-300 decoration-2 underline-offset-2 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded px-0.5' : ''}`}
              >
                {word}
              </span>
            );
          })}
        </p>
      </GlassCard>

      {/* Vocabulary section */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('vocabulary', uiLang)}</h3>
        <div className="space-y-2">
          {story.vocabulary.map((v, i) => (
            <GlassCard key={i} className="!p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">{v.word}</span>
                <span className="text-gray-400 mx-2">-</span>
                <span className="text-gray-600 dark:text-gray-400">{v.translation}</span>
              </div>
              <button
                onClick={() => addWord({ id: v.word.replace(/\s/g, '-'), word: v.word, translation: v.translation, definition: v.definition, cefrLevel: story.level, category: 'reading' })}
                className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-500"
              >
                <Plus size={16} />
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      <AnimatedButton onClick={() => setShowQuiz(true)} size="full" variant="primary">
        {t('comprehension', uiLang)} →
      </AnimatedButton>

      {/* Word detail modal */}
      <Modal isOpen={!!selectedWord} onClose={() => setSelectedWord(null)} title={selectedWord?.word}>
        {selectedWord && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={() => speak(selectedWord.word)} className="p-2 rounded-full bg-brand-100 dark:bg-brand-900/30">
                <Volume2 size={18} className="text-brand-600" />
              </button>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{selectedWord.word}</span>
            </div>
            <p className="text-lg text-brand-600 dark:text-brand-400 font-medium">{selectedWord.translation}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedWord.definition}</p>
            <AnimatedButton
              onClick={() => {
                addWord({ id: selectedWord.word.replace(/\s/g, '-'), word: selectedWord.word, translation: selectedWord.translation, definition: selectedWord.definition, category: 'reading' });
                setSelectedWord(null);
              }}
              size="full" variant="secondary" icon={Plus}
            >
              {t('addToVocabulary', uiLang)}
            </AnimatedButton>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ReadingPage() {
  const { uiLang } = useTheme();
  const { progress } = useUserProgress();
  const [selectedStory, setSelectedStory] = useState(null);

  // Filter stories by user level
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const userLevelIdx = levelOrder.indexOf(progress.cefrLevel || 'A1');
  const availableStories = STORIES.filter(s => levelOrder.indexOf(s.level) <= userLevelIdx + 1);

  if (selectedStory) {
    return <ReadingView story={selectedStory} onBack={() => setSelectedStory(null)} />;
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {t('stories', uiLang)}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {uiLang === 'he' ? 'קרא סיפורים ולמד מילים חדשות' : 'Read stories and learn new words'}
      </p>
      <div className="space-y-3">
        {availableStories.map(story => (
          <StoryCard key={story.id} story={story} onClick={() => setSelectedStory(story)} />
        ))}
      </div>
    </div>
  );
}
