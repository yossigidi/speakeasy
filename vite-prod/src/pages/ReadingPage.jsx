import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Clock, Volume2, VolumeX, ArrowLeft, Plus, Check, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t, lf, RTL_LANGS } from '../utils/translations.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import useSpacedRepetition from '../hooks/useSpacedRepetition.js';
import KidsIntro from '../components/kids/KidsIntro.jsx';
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
  // B1 stories
  {
    id: 's6', level: 'B1', topic: 'Hobbies', topicHe: 'תחביבים',
    title: 'Finding a New Hobby', titleHe: 'למצוא תחביב חדש', readTime: 4,
    text: `When I turned thirty, I realized I spent most of my free time watching television or scrolling through social media. I decided it was time to find a real hobby. My friend suggested I try painting, so I signed up for a beginner watercolor class at the local community center. At first, I was terrible. My paintings looked nothing like what the teacher showed us. But the teacher encouraged me to keep trying, saying that everyone starts somewhere. After a few weeks, I noticed I was improving. I could mix colors better and my brushstrokes were more confident. The best part was that painting helped me relax after long days at work. Now, six months later, I paint every weekend. I have even sold a few paintings at a local market. More importantly, I discovered that trying something new, even when you are not good at it, can bring a lot of joy into your life.`,
    vocabulary: [
      { word: 'realized', translation: 'הבנתי', definition: 'Became aware of something' },
      { word: 'scrolling', translation: 'גלילה', definition: 'Moving through content on a screen' },
      { word: 'encouraged', translation: 'עודד', definition: 'Gave someone confidence to do something' },
      { word: 'improving', translation: 'משתפר', definition: 'Getting better at something' },
      { word: 'confident', translation: 'בטוח', definition: 'Sure of yourself or your abilities' },
    ],
    questions: [
      { question: 'Why did the person decide to find a hobby?', options: ['They were bored at work', 'They spent too much time on screens', 'Their doctor told them to', 'They wanted to make money'], correct: 1 },
      { question: 'How did the person feel about painting at first?', options: ['Very talented', 'Terrible', 'Indifferent', 'Angry'], correct: 1 },
      { question: 'What happened after six months?', options: ['They quit', 'They became a teacher', 'They sold some paintings', 'They switched to drawing'], correct: 2 },
    ]
  },
  {
    id: 's7', level: 'B1', topic: 'Health', topicHe: 'בריאות',
    title: 'A Healthier Lifestyle', titleHe: 'אורח חיים בריא יותר', readTime: 4,
    text: `Last year, my doctor told me I needed to make some changes to my lifestyle. My blood pressure was too high, and I was not getting enough exercise. I decided to start small. First, I began walking for thirty minutes every morning before work. It was difficult at first because I had to wake up earlier, but soon it became a habit. Then I started cooking more meals at home instead of ordering fast food. I learned to make simple, healthy dishes like grilled chicken with vegetables and homemade soup. I also reduced the amount of sugar in my diet by replacing soft drinks with water and herbal tea. After three months, I went back to the doctor. My blood pressure had improved significantly, and I had lost five kilograms. The doctor was impressed and told me to keep going. The experience taught me that small, consistent changes can lead to big results over time.`,
    vocabulary: [
      { word: 'lifestyle', translation: 'אורח חיים', definition: 'The way a person lives' },
      { word: 'blood pressure', translation: 'לחץ דם', definition: 'The force of blood against artery walls' },
      { word: 'habit', translation: 'הרגל', definition: 'Something you do regularly without thinking' },
      { word: 'reduced', translation: 'הפחית', definition: 'Made something smaller or less' },
      { word: 'consistent', translation: 'עקבי', definition: 'Doing something the same way over time' },
    ],
    questions: [
      { question: 'Why did the person need to change their lifestyle?', options: ['To save money', 'High blood pressure', 'To run a marathon', 'They were bored'], correct: 1 },
      { question: 'What was the first change they made?', options: ['Changed their diet', 'Started walking', 'Joined a gym', 'Stopped drinking coffee'], correct: 1 },
      { question: 'What were the results after three months?', options: ['No change', 'Improved blood pressure and weight loss', 'Worse blood pressure', 'They gained weight'], correct: 1 },
    ]
  },
  // B2 stories
  {
    id: 's8', level: 'B2', topic: 'Technology', topicHe: 'טכנולוגיה',
    title: 'The Digital Divide', titleHe: 'הפער הדיגיטלי', readTime: 5,
    text: `While technology has transformed nearly every aspect of modern life, its benefits are not equally distributed. The term "digital divide" refers to the gap between those who have access to digital technology and those who do not. In many developing countries, millions of people still lack reliable internet connections. Even in wealthy nations, rural communities often struggle with slow or expensive internet service. This inequality has serious consequences. During the pandemic, students without internet access fell behind their peers who could attend online classes. Workers who could not connect remotely lost their jobs, while those with good internet connections adapted to working from home. Governments around the world are beginning to recognize that internet access is no longer a luxury but a necessity. Several countries have launched ambitious programs to bring high-speed internet to underserved areas. However, simply providing access is not enough. Digital literacy programs are also essential to ensure that people can effectively use the technology available to them. Bridging the digital divide will require sustained effort and investment from both the public and private sectors.`,
    vocabulary: [
      { word: 'distributed', translation: 'מחולק', definition: 'Spread or shared among people' },
      { word: 'consequences', translation: 'השלכות', definition: 'Results or effects of an action' },
      { word: 'adapted', translation: 'הסתגל', definition: 'Changed to fit a new situation' },
      { word: 'ambitious', translation: 'שאפתני', definition: 'Having a strong desire to succeed' },
      { word: 'sustained', translation: 'מתמשך', definition: 'Continuing for a long time' },
    ],
    questions: [
      { question: 'What does "digital divide" refer to?', options: ['A type of software', 'The gap in access to technology', 'A new smartphone', 'Social media platforms'], correct: 1 },
      { question: 'What happened to students without internet during the pandemic?', options: ['They studied harder', 'They fell behind', 'They moved to cities', 'Nothing changed'], correct: 1 },
      { question: 'What do governments now recognize about internet access?', options: ['It is a luxury', 'It is unnecessary', 'It is a necessity', 'It is too expensive'], correct: 2 },
    ]
  },
  {
    id: 's9', level: 'B2', topic: 'Culture', topicHe: 'תרבות',
    title: 'The Power of Music', titleHe: 'כוחה של המוזיקה', readTime: 5,
    text: `Music is often described as a universal language, and research increasingly supports this idea. Studies have shown that people from different cultures can recognize basic emotions in music, even when they have never heard that particular style before. A happy melody sounds happy whether you are in Tokyo, Lagos, or Buenos Aires. But music does more than just convey emotions. Neuroscientists have discovered that listening to music activates multiple areas of the brain simultaneously, including regions responsible for memory, movement, and emotion. This is why a familiar song can instantly transport you back to a specific moment in your past. Hospitals are now using music therapy to help patients recover from strokes, manage chronic pain, and cope with anxiety. In schools, children who learn to play musical instruments often show improved performance in mathematics and reading. Some researchers even suggest that making music together strengthens social bonds, which may explain why every known human culture has developed some form of musical expression. Whether you are a professional musician or someone who simply enjoys singing in the shower, music has a profound impact on your brain and your well-being.`,
    vocabulary: [
      { word: 'universal', translation: 'אוניברסלי', definition: 'Relating to everyone in the world' },
      { word: 'convey', translation: 'להעביר', definition: 'To communicate or express' },
      { word: 'simultaneously', translation: 'בו-זמנית', definition: 'At the same time' },
      { word: 'chronic', translation: 'כרוני', definition: 'Lasting a long time, especially of illness' },
      { word: 'profound', translation: 'עמוק', definition: 'Very deep or great' },
    ],
    questions: [
      { question: 'What can people from different cultures recognize in music?', options: ['Specific instruments', 'Song lyrics', 'Basic emotions', 'Musical theory'], correct: 2 },
      { question: 'What does music activate in the brain?', options: ['Only the memory region', 'Multiple areas simultaneously', 'Only the emotion center', 'Nothing measurable'], correct: 1 },
      { question: 'What benefit is mentioned for children learning instruments?', options: ['Better social skills only', 'Improved math and reading', 'Better physical health', 'Higher income later'], correct: 1 },
    ]
  },
  // C1 story
  {
    id: 's10', level: 'C1', topic: 'Opinion', topicHe: 'דעה',
    title: 'The Case for Boredom', titleHe: 'למה שעמום זה דבר טוב', readTime: 5,
    text: `In an age of constant stimulation, boredom has become something we desperately try to avoid. The moment we find ourselves with nothing to do, we instinctively reach for our smartphones, seeking the instant gratification of a notification, a video, or a social media update. Yet a growing body of psychological research suggests that this reflexive avoidance of boredom may be doing us more harm than good. When the mind is allowed to wander without direction, it enters a state that psychologists call the "default mode network." This is the mental space where creativity flourishes, where we make unexpected connections between ideas, and where we engage in the kind of deep self-reflection that is essential for personal growth. Some of history's greatest breakthroughs came during moments of apparent idleness. Newton supposedly conceived his theory of gravity while sitting under an apple tree with nothing particular to do. By constantly filling every quiet moment with digital distraction, we may be robbing ourselves of the mental space needed for innovation and self-understanding. This does not mean we should seek out boredom deliberately, but perhaps we should resist the urge to eliminate it the moment it appears. The next time you find yourself bored, consider putting your phone away and simply letting your mind drift. You might be surprised by where it takes you.`,
    vocabulary: [
      { word: 'stimulation', translation: 'גירוי', definition: 'Something that causes interest or excitement' },
      { word: 'instinctively', translation: 'באופן אינסטינקטיבי', definition: 'Done without conscious thought' },
      { word: 'gratification', translation: 'סיפוק', definition: 'The feeling of being satisfied' },
      { word: 'flourishes', translation: 'פורח', definition: 'Grows or develops successfully' },
      { word: 'innovation', translation: 'חדשנות', definition: 'A new idea, method, or invention' },
    ],
    questions: [
      { question: 'What do people typically do when they feel bored?', options: ['Exercise', 'Read books', 'Reach for smartphones', 'Talk to friends'], correct: 2 },
      { question: 'What happens in the "default mode network"?', options: ['The brain shuts down', 'Creativity and self-reflection occur', 'We fall asleep', 'We become anxious'], correct: 1 },
      { question: 'What is the author\'s main argument?', options: ['Boredom is always bad', 'We should be bored all the time', 'We should not always avoid boredom', 'Smartphones are harmful'], correct: 2 },
    ]
  },
];

const LEVEL_COLORS = {
  A1: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  A2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  B1: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  B2: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  C1: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${LEVEL_COLORS[story.level] || 'bg-purple-100 text-purple-700'}`}>{story.level}</span>
            <span className="text-xs text-gray-400">{lf(story, 'topic', uiLang)}</span>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white truncate">
            {lf(story, 'title', uiLang)}
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
  const { speak, speakWordPair, stop, isSpeaking } = useSpeechSynthesis();
  const { addWord } = useSpacedRepetition();
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [addedWords, setAddedWords] = useState(new Set());

  const toggleReadAloud = useCallback(() => {
    if (isReadingAloud) {
      stop();
      setIsReadingAloud(false);
    } else {
      stop();
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
  const xpAwardedRef = useRef(false);

  const words = story.text.split(/(\s+)/);

  const handleWordClick = (word) => {
    const clean = word.replace(/[^\w']/g, '').toLowerCase();
    const vocab = story.vocabulary.find(v => v.word.toLowerCase() === clean || v.word.toLowerCase().includes(clean));
    if (vocab) setSelectedWord(vocab);
  };

  // B1: Add word with visual feedback
  const handleAddWord = async (v) => {
    await addWord({ id: v.word.replace(/\s/g, '-'), word: v.word, translation: v.translation, definition: v.definition, cefrLevel: story.level, category: 'reading' });
    setAddedWords(prev => new Set([...prev, v.word]));
  };

  // B6: Select-then-check quiz flow
  const handleQuizSelect = (idx) => {
    if (quizAnswered) return;
    setSelectedQuizAnswer(idx);
  };

  const checkQuizAnswer = () => {
    setQuizAnswered(true);
    if (selectedQuizAnswer === story.questions[quizIndex].correct) {
      setQuizCorrect(c => c + 1);
    }
  };

  const nextQuestion = () => {
    setQuizIndex(prev => {
      if (prev + 1 >= story.questions.length) {
        setQuizDone(true);
        if (!xpAwardedRef.current) {
          xpAwardedRef.current = true;
          addXP(20, 'reading');
        }
        return prev;
      }
      setQuizAnswered(false);
      setSelectedQuizAnswer(null);
      return prev + 1;
    });
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
          <button onClick={() => setShowQuiz(false)} className="p-3 -ml-1 rounded-lg hover:bg-black/5 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={20} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
          </button>
          <span className="text-sm text-gray-500">{quizIndex + 1}/{story.questions.length}</span>
        </div>
        <GlassCard variant="strong">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{q.question}</h3>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleQuizSelect(i)}
                className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all border-2 ${
                  quizAnswered
                    ? i === q.correct ? 'bg-emerald-100 border-emerald-500' : i === selectedQuizAnswer ? 'bg-red-100 border-red-500' : 'bg-gray-50 border-transparent'
                    : selectedQuizAnswer === i ? 'bg-brand-50 border-brand-500' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                {opt}
              </button>
            ))}
          </div>
          {selectedQuizAnswer !== null && !quizAnswered && (
            <AnimatedButton onClick={checkQuizAnswer} size="full" className="mt-4">
              {t('check', uiLang)}
            </AnimatedButton>
          )}
          {quizAnswered && (
            <AnimatedButton onClick={nextQuestion} size="full" className="mt-4">{t('continue', uiLang)}</AnimatedButton>
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* B2: Larger back button with safe area padding */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="p-3 -ml-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft size={22} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
        </button>
        <button onClick={toggleReadAloud} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
          isReadingAloud
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
            : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600'
        }`}>
          {isReadingAloud ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {isReadingAloud
            ? t('stopAudio', uiLang)
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

      {/* Vocabulary section — B5: tappable cards that speak both languages */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('vocabulary', uiLang)}</h3>
        <div className="space-y-2">
          {story.vocabulary.map((v, i) => (
            <GlassCard key={i} onClick={() => speakWordPair(v.word, v.translation)} className="cursor-pointer !p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">{v.word}</span>
                <span className="text-gray-400 mx-2">-</span>
                <span className="text-gray-600 dark:text-gray-400">{v.translation}</span>
              </div>
              {/* B1: "+" button with checkmark feedback */}
              <button
                onClick={(e) => { e.stopPropagation(); if (!addedWords.has(v.word)) handleAddWord(v); }}
                disabled={addedWords.has(v.word)}
                className={`p-1.5 rounded-lg transition-colors ${
                  addedWords.has(v.word)
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                    : 'hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-500'
                }`}
              >
                {addedWords.has(v.word) ? <Check size={16} /> : <Plus size={16} />}
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      <AnimatedButton onClick={() => setShowQuiz(true)} size="full" variant="primary">
        {t('comprehension', uiLang)} →
      </AnimatedButton>

      {/* Word detail modal — B5: speakWordPair in modal */}
      <Modal isOpen={!!selectedWord} onClose={() => setSelectedWord(null)} title={selectedWord?.word}>
        {selectedWord && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={() => speakWordPair(selectedWord.word, selectedWord.translation)} className="p-2 rounded-full bg-brand-100 dark:bg-brand-900/30">
                <Volume2 size={18} className="text-brand-600" />
              </button>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{selectedWord.word}</span>
            </div>
            <p className="text-lg text-brand-600 dark:text-brand-400 font-medium">{selectedWord.translation}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedWord.definition}</p>
            <AnimatedButton
              onClick={() => {
                handleAddWord(selectedWord);
                setSelectedWord(null);
              }}
              size="full" variant="secondary" icon={addedWords.has(selectedWord.word) ? Check : Plus}
            >
              {addedWords.has(selectedWord.word)
                ? t('wordAdded', uiLang)
                : t('addToVocabulary', uiLang)}
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
  const [levelFilter, setLevelFilter] = useState('all');

  // Filter stories by user level
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const userLevelIdx = levelOrder.indexOf(progress.cefrLevel || 'A1');
  const availableStories = STORIES.filter(s => levelOrder.indexOf(s.level) <= userLevelIdx + 1);

  // B4: Level filter
  const availableLevels = [...new Set(availableStories.map(s => s.level))];
  const filteredStories = levelFilter === 'all'
    ? availableStories
    : availableStories.filter(s => s.level === levelFilter);

  if (selectedStory) {
    return <ReadingView story={selectedStory} onBack={() => setSelectedStory(null)} />;
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <KidsIntro
        id="reading-v3"
        name={progress.displayName}
        emoji="📖"
        title="Speakli's Stories!"
        titleHe="הסיפורים של ספיקלי!"
        desc="Read Speakli's stories and learn new words along the way!"
        descHe="קראו את הסיפורים של ספיקלי ולמדו מילים חדשות בדרך!"
        uiLang={uiLang}
        gradient="from-blue-500 via-sky-500 to-cyan-500"
        buttonLabel="Let's read with Speakli!"
        buttonLabelHe="בואו נקרא עם ספיקלי!"
      />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {t('stories', uiLang)}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('readStoriesDesc', uiLang)}
      </p>

      {/* B4: Level filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setLevelFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            levelFilter === 'all'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {t('allFilter', uiLang)}
        </button>
        {availableLevels.map(level => (
          <button
            key={level}
            onClick={() => setLevelFilter(level)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              levelFilter === level
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : LEVEL_COLORS[level] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredStories.map(story => (
          <StoryCard key={story.id} story={story} onClick={() => setSelectedStory(story)} />
        ))}
      </div>
    </div>
  );
}
