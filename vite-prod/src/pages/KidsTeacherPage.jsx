import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import SpeakliAvatar from '../components/kids/SpeakliAvatar.jsx';
import SpeechBubble from '../components/teacher/SpeechBubble.jsx';
import ExerciseRenderer from '../components/teacher/ExerciseRenderer.jsx';
import ConfettiExplosion from '../components/shared/ConfettiExplosion.jsx';
import KidsIntro from '../components/kids/KidsIntro.jsx';
import { playCorrect, playWrong, playComplete, playStar } from '../utils/gameSounds.js';
import { stopAllAudio } from '../utils/hebrewAudio.js';
import { WORDS_BY_LEVEL } from '../data/kids-vocabulary.js';
import { t, lf, RTL_LANGS } from '../utils/translations.js';
import { Lock } from 'lucide-react';
import useContentGate from '../hooks/useContentGate.js';
import PaywallModal from '../components/subscription/PaywallModal.jsx';

const TEACHER_TOPICS = [
  { id: 'colors', emoji: '🎨', titleHe: 'צבעים', titleEn: 'Colors', titleAr: 'الألوان', titleRu: 'Цвета', level: 1, gradient: 'linear-gradient(135deg, #FF6B6B, #FFE66D)' },
  { id: 'animals', emoji: '🐾', titleHe: 'חיות', titleEn: 'Animals', titleAr: 'الحيوانات', titleRu: 'Животные', level: 1, gradient: 'linear-gradient(135deg, #4ECDC4, #44CF6C)' },
  { id: 'numbers', emoji: '🔢', titleHe: 'מספרים', titleEn: 'Numbers', titleAr: 'الأرقام', titleRu: 'Числа', level: 1, gradient: 'linear-gradient(135deg, #A78BFA, #818CF8)' },
  { id: 'fruits', emoji: '🍎', titleHe: 'פירות', titleEn: 'Fruits', titleAr: 'الفواكه', titleRu: 'Фрукты', level: 1, gradient: 'linear-gradient(135deg, #F472B6, #FB923C)' },
  { id: 'greetings', emoji: '👋', titleHe: 'ברכות', titleEn: 'Greetings', titleAr: 'التحيات', titleRu: 'Приветствия', level: 1, gradient: 'linear-gradient(135deg, #60A5FA, #34D399)' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', titleHe: 'משפחה', titleEn: 'Family', titleAr: 'العائلة', titleRu: 'Семья', level: 2, gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  { id: 'body', emoji: '🦶', titleHe: 'גוף', titleEn: 'Body', titleAr: 'الجسم', titleRu: 'Тело', level: 2, gradient: 'linear-gradient(135deg, #EC4899, #8B5CF6)' },
  { id: 'classroom', emoji: '🏫', titleHe: 'כיתה', titleEn: 'Classroom', titleAr: 'الفصل الدراسي', titleRu: 'Класс', level: 2, gradient: 'linear-gradient(135deg, #14B8A6, #3B82F6)' },
  { id: 'food', emoji: '🍔', titleHe: 'אוכל', titleEn: 'Food', titleAr: 'الطعام', titleRu: 'Еда', level: 2, gradient: 'linear-gradient(135deg, #F97316, #FACC15)' },
  { id: 'sizes', emoji: '📏', titleHe: 'גדלים', titleEn: 'Sizes', titleAr: 'الأحجام', titleRu: 'Размеры', level: 2, gradient: 'linear-gradient(135deg, #6366F1, #EC4899)' },
  { id: 'weather', emoji: '🌤️', titleHe: 'מזג אוויר', titleEn: 'Weather', titleAr: 'الطقس', titleRu: 'Погода', level: 3, gradient: 'linear-gradient(135deg, #38BDF8, #818CF8)' },
  { id: 'home', emoji: '🏠', titleHe: 'הבית', titleEn: 'Home', titleAr: 'المنزل', titleRu: 'Дом', level: 3, gradient: 'linear-gradient(135deg, #A78BFA, #F472B6)' },
  { id: 'clothes', emoji: '👕', titleHe: 'בגדים', titleEn: 'Clothes', titleAr: 'الملابس', titleRu: 'Одежда', level: 3, gradient: 'linear-gradient(135deg, #FB7185, #FBBF24)' },
  { id: 'transport', emoji: '🚗', titleHe: 'תחבורה', titleEn: 'Transport', titleAr: 'المواصلات', titleRu: 'Транспорт', level: 3, gradient: 'linear-gradient(135deg, #2DD4BF, #3B82F6)' },
  { id: 'nature', emoji: '🌳', titleHe: 'טבע', titleEn: 'Nature', titleAr: 'الطبيعة', titleRu: 'Природа', level: 3, gradient: 'linear-gradient(135deg, #22C55E, #14B8A6)' },
  { id: 'daily_routine', emoji: '⏰', titleHe: 'שגרה יומית', titleEn: 'Daily Routine', titleAr: 'الروتين اليومي', titleRu: 'Распорядок дня', level: 4, gradient: 'linear-gradient(135deg, #F59E0B, #EC4899)' },
  { id: 'store', emoji: '🛍️', titleHe: 'חנות', titleEn: 'Store', titleAr: 'المتجر', titleRu: 'Магазин', level: 4, gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' },
  { id: 'hobbies', emoji: '🎯', titleHe: 'תחביבים', titleEn: 'Hobbies', titleAr: 'الهوايات', titleRu: 'Хобби', level: 4, gradient: 'linear-gradient(135deg, #EF4444, #F97316)' },
  { id: 'verbs', emoji: '🏃', titleHe: 'פעלים', titleEn: 'Verbs', titleAr: 'الأفعال', titleRu: 'Глаголы', level: 4, gradient: 'linear-gradient(135deg, #6366F1, #22C55E)' },
];

const TOPIC_WORDS = {
  colors: [
    { word: 'Red', emoji: '🔴', translation: 'אדום', translationAr: 'أحمر', translationRu: 'красный' },
    { word: 'Blue', emoji: '🔵', translation: 'כחול', translationAr: 'أزرق', translationRu: 'синий' },
    { word: 'Green', emoji: '🟢', translation: 'ירוק', translationAr: 'أخضر', translationRu: 'зелёный' },
    { word: 'Yellow', emoji: '🟡', translation: 'צהוב', translationAr: 'أصفر', translationRu: 'жёлтый' },
    { word: 'Purple', emoji: '🟣', translation: 'סגול', translationAr: 'بنفسجي', translationRu: 'фиолетовый' },
    { word: 'Orange', emoji: '🟠', translation: 'כתום', translationAr: 'برتقالي', translationRu: 'оранжевый' },
    { word: 'Pink', emoji: '🩷', translation: 'ורוד', translationAr: 'وردي', translationRu: 'розовый' },
    { word: 'White', emoji: '⬜', translation: 'לבן', translationAr: 'أبيض', translationRu: 'белый' },
    { word: 'Black', emoji: '⬛', translation: 'שחור', translationAr: 'أسود', translationRu: 'чёрный' },
    { word: 'Brown', emoji: '🟤', translation: 'חום', translationAr: 'بني', translationRu: 'коричневый' },
  ],
  animals: [
    { word: 'Dog', emoji: '🐕', translation: 'כלב', translationAr: 'كلب', translationRu: 'собака' },
    { word: 'Cat', emoji: '🐈', translation: 'חתול', translationAr: 'قطة', translationRu: 'кошка' },
    { word: 'Bird', emoji: '🐦', translation: 'ציפור', translationAr: 'طائر', translationRu: 'птица' },
    { word: 'Fish', emoji: '🐟', translation: 'דג', translationAr: 'سمكة', translationRu: 'рыба' },
    { word: 'Horse', emoji: '🐴', translation: 'סוס', translationAr: 'حصان', translationRu: 'лошадь' },
    { word: 'Cow', emoji: '🐄', translation: 'פרה', translationAr: 'بقرة', translationRu: 'корова' },
    { word: 'Lion', emoji: '🦁', translation: 'אריה', translationAr: 'أسد', translationRu: 'лев' },
    { word: 'Elephant', emoji: '🐘', translation: 'פיל', translationAr: 'فيل', translationRu: 'слон' },
    { word: 'Rabbit', emoji: '🐰', translation: 'ארנב', translationAr: 'أرنب', translationRu: 'кролик' },
    { word: 'Bear', emoji: '🐻', translation: 'דוב', translationAr: 'دب', translationRu: 'медведь' },
  ],
  numbers: [
    { word: 'One', emoji: '1️⃣', translation: 'אחד', translationAr: 'واحد', translationRu: 'один' },
    { word: 'Two', emoji: '2️⃣', translation: 'שניים', translationAr: 'اثنان', translationRu: 'два' },
    { word: 'Three', emoji: '3️⃣', translation: 'שלושה', translationAr: 'ثلاثة', translationRu: 'три' },
    { word: 'Four', emoji: '4️⃣', translation: 'ארבעה', translationAr: 'أربعة', translationRu: 'четыре' },
    { word: 'Five', emoji: '5️⃣', translation: 'חמישה', translationAr: 'خمسة', translationRu: 'пять' },
    { word: 'Six', emoji: '6️⃣', translation: 'שישה', translationAr: 'ستة', translationRu: 'шесть' },
    { word: 'Seven', emoji: '7️⃣', translation: 'שבעה', translationAr: 'سبعة', translationRu: 'семь' },
    { word: 'Eight', emoji: '8️⃣', translation: 'שמונה', translationAr: 'ثمانية', translationRu: 'восемь' },
    { word: 'Nine', emoji: '9️⃣', translation: 'תשעה', translationAr: 'تسعة', translationRu: 'девять' },
    { word: 'Ten', emoji: '🔟', translation: 'עשרה', translationAr: 'عشرة', translationRu: 'десять' },
  ],
  fruits: [
    { word: 'Apple', emoji: '🍎', translation: 'תפוח', translationAr: 'تفاحة', translationRu: 'яблоко' },
    { word: 'Banana', emoji: '🍌', translation: 'בננה', translationAr: 'موزة', translationRu: 'банан' },
    { word: 'Orange', emoji: '🍊', translation: 'תפוז', translationAr: 'برتقالة', translationRu: 'апельсин' },
    { word: 'Grape', emoji: '🍇', translation: 'ענב', translationAr: 'عنب', translationRu: 'виноград' },
    { word: 'Strawberry', emoji: '🍓', translation: 'תות', translationAr: 'فراولة', translationRu: 'клубника' },
    { word: 'Watermelon', emoji: '🍉', translation: 'אבטיח', translationAr: 'بطيخ', translationRu: 'арбуз' },
    { word: 'Pineapple', emoji: '🍍', translation: 'אננס', translationAr: 'أناناس', translationRu: 'ананас' },
    { word: 'Cherry', emoji: '🍒', translation: 'דובדבן', translationAr: 'كرز', translationRu: 'вишня' },
    { word: 'Peach', emoji: '🍑', translation: 'אפרסק', translationAr: 'خوخ', translationRu: 'персик' },
    { word: 'Lemon', emoji: '🍋', translation: 'לימון', translationAr: 'ليمون', translationRu: 'лимон' },
  ],
  greetings: [
    { word: 'Hello', emoji: '👋', translation: 'שלום', translationAr: 'مرحباً', translationRu: 'привет' },
    { word: 'Goodbye', emoji: '👋', translation: 'להתראות', translationAr: 'وداعاً', translationRu: 'до свидания' },
    { word: 'Thank you', emoji: '🙏', translation: 'תודה', translationAr: 'شكراً', translationRu: 'спасибо' },
    { word: 'Please', emoji: '🤲', translation: 'בבקשה', translationAr: 'من فضلك', translationRu: 'пожалуйста' },
    { word: 'Yes', emoji: '✅', translation: 'כן', translationAr: 'نعم', translationRu: 'да' },
    { word: 'No', emoji: '❌', translation: 'לא', translationAr: 'لا', translationRu: 'нет' },
    { word: 'Good morning', emoji: '🌅', translation: 'בוקר טוב', translationAr: 'صباح الخير', translationRu: 'доброе утро' },
    { word: 'Good night', emoji: '🌙', translation: 'לילה טוב', translationAr: 'تصبح على خير', translationRu: 'спокойной ночи' },
    { word: 'How are you?', emoji: '😊', translation: 'מה שלומך?', translationAr: 'كيف حالك؟', translationRu: 'как дела?' },
    { word: 'My name is', emoji: '🏷️', translation: 'קוראים לי', translationAr: 'اسمي', translationRu: 'меня зовут' },
  ],
  family: [
    { word: 'Mother', emoji: '👩', translation: 'אמא', translationAr: 'أم', translationRu: 'мама' },
    { word: 'Father', emoji: '👨', translation: 'אבא', translationAr: 'أب', translationRu: 'папа' },
    { word: 'Brother', emoji: '👦', translation: 'אח', translationAr: 'أخ', translationRu: 'брат' },
    { word: 'Sister', emoji: '👧', translation: 'אחות', translationAr: 'أخت', translationRu: 'сестра' },
    { word: 'Baby', emoji: '👶', translation: 'תינוק', translationAr: 'طفل رضيع', translationRu: 'малыш' },
    { word: 'Grandmother', emoji: '👵', translation: 'סבתא', translationAr: 'جدة', translationRu: 'бабушка' },
    { word: 'Grandfather', emoji: '👴', translation: 'סבא', translationAr: 'جد', translationRu: 'дедушка' },
    { word: 'Family', emoji: '👨‍👩‍👧‍👦', translation: 'משפחה', translationAr: 'عائلة', translationRu: 'семья' },
    { word: 'Uncle', emoji: '👨', translation: 'דוד', translationAr: 'عم', translationRu: 'дядя' },
    { word: 'Aunt', emoji: '👩', translation: 'דודה', translationAr: 'عمة', translationRu: 'тётя' },
  ],
  body: [
    { word: 'Head', emoji: '😀', translation: 'ראש', translationAr: 'رأس', translationRu: 'голова' },
    { word: 'Hand', emoji: '✋', translation: 'יד', translationAr: 'يد', translationRu: 'рука' },
    { word: 'Eye', emoji: '👁️', translation: 'עין', translationAr: 'عين', translationRu: 'глаз' },
    { word: 'Nose', emoji: '👃', translation: 'אף', translationAr: 'أنف', translationRu: 'нос' },
    { word: 'Mouth', emoji: '👄', translation: 'פה', translationAr: 'فم', translationRu: 'рот' },
    { word: 'Ear', emoji: '👂', translation: 'אוזן', translationAr: 'أذن', translationRu: 'ухо' },
    { word: 'Foot', emoji: '🦶', translation: 'רגל', translationAr: 'قدم', translationRu: 'нога' },
    { word: 'Hair', emoji: '💇', translation: 'שיער', translationAr: 'شعر', translationRu: 'волосы' },
    { word: 'Heart', emoji: '❤️', translation: 'לב', translationAr: 'قلب', translationRu: 'сердце' },
    { word: 'Teeth', emoji: '🦷', translation: 'שיניים', translationAr: 'أسنان', translationRu: 'зубы' },
  ],
  classroom: [
    { word: 'Book', emoji: '📖', translation: 'ספר', translationAr: 'كتاب', translationRu: 'книга' },
    { word: 'Pencil', emoji: '✏️', translation: 'עיפרון', translationAr: 'قلم رصاص', translationRu: 'карандаш' },
    { word: 'Teacher', emoji: '👩‍🏫', translation: 'מורה', translationAr: 'معلمة', translationRu: 'учитель' },
    { word: 'School', emoji: '🏫', translation: 'בית ספר', translationAr: 'مدرسة', translationRu: 'школа' },
    { word: 'Table', emoji: '🪑', translation: 'שולחן', translationAr: 'طاولة', translationRu: 'стол' },
    { word: 'Chair', emoji: '💺', translation: 'כיסא', translationAr: 'كرسي', translationRu: 'стул' },
    { word: 'Bag', emoji: '🎒', translation: 'תיק', translationAr: 'حقيبة', translationRu: 'сумка' },
    { word: 'Clock', emoji: '🕐', translation: 'שעון', translationAr: 'ساعة', translationRu: 'часы' },
    { word: 'Paper', emoji: '📄', translation: 'נייר', translationAr: 'ورقة', translationRu: 'бумага' },
    { word: 'Color', emoji: '🎨', translation: 'צבע', translationAr: 'لون', translationRu: 'цвет' },
  ],
  food: [
    { word: 'Bread', emoji: '🍞', translation: 'לחם', translationAr: 'خبز', translationRu: 'хлеб' },
    { word: 'Milk', emoji: '🥛', translation: 'חלב', translationAr: 'حليب', translationRu: 'молоко' },
    { word: 'Egg', emoji: '🥚', translation: 'ביצה', translationAr: 'بيضة', translationRu: 'яйцо' },
    { word: 'Rice', emoji: '🍚', translation: 'אורז', translationAr: 'أرز', translationRu: 'рис' },
    { word: 'Pizza', emoji: '🍕', translation: 'פיצה', translationAr: 'بيتزا', translationRu: 'пицца' },
    { word: 'Ice cream', emoji: '🍦', translation: 'גלידה', translationAr: 'آيس كريم', translationRu: 'мороженое' },
    { word: 'Cake', emoji: '🎂', translation: 'עוגה', translationAr: 'كعكة', translationRu: 'торт' },
    { word: 'Water', emoji: '💧', translation: 'מים', translationAr: 'ماء', translationRu: 'вода' },
    { word: 'Juice', emoji: '🧃', translation: 'מיץ', translationAr: 'عصير', translationRu: 'сок' },
    { word: 'Cookie', emoji: '🍪', translation: 'עוגיה', translationAr: 'بسكويت', translationRu: 'печенье' },
  ],
  sizes: [
    { word: 'Big', emoji: '🐘', translation: 'גדול', translationAr: 'كبير', translationRu: 'большой' },
    { word: 'Small', emoji: '🐜', translation: 'קטן', translationAr: 'صغير', translationRu: 'маленький' },
    { word: 'Tall', emoji: '🦒', translation: 'גבוה', translationAr: 'طويل', translationRu: 'высокий' },
    { word: 'Short', emoji: '🐁', translation: 'נמוך', translationAr: 'قصير', translationRu: 'низкий' },
    { word: 'Long', emoji: '🐍', translation: 'ארוך', translationAr: 'طويل', translationRu: 'длинный' },
    { word: 'Fast', emoji: '🐆', translation: 'מהיר', translationAr: 'سريع', translationRu: 'быстрый' },
    { word: 'Slow', emoji: '🐢', translation: 'איטי', translationAr: 'بطيء', translationRu: 'медленный' },
    { word: 'Heavy', emoji: '🏋️', translation: 'כבד', translationAr: 'ثقيل', translationRu: 'тяжёлый' },
    { word: 'Light', emoji: '🪶', translation: 'קל', translationAr: 'خفيف', translationRu: 'лёгкий' },
    { word: 'Wide', emoji: '↔️', translation: 'רחב', translationAr: 'عريض', translationRu: 'широкий' },
  ],
  weather: [
    { word: 'Sun', emoji: '☀️', translation: 'שמש', translationAr: 'شمس', translationRu: 'солнце' },
    { word: 'Rain', emoji: '🌧️', translation: 'גשם', translationAr: 'مطر', translationRu: 'дождь' },
    { word: 'Cloud', emoji: '☁️', translation: 'ענן', translationAr: 'غيمة', translationRu: 'облако' },
    { word: 'Snow', emoji: '❄️', translation: 'שלג', translationAr: 'ثلج', translationRu: 'снег' },
    { word: 'Wind', emoji: '💨', translation: 'רוח', translationAr: 'رياح', translationRu: 'ветер' },
    { word: 'Hot', emoji: '🔥', translation: 'חם', translationAr: 'حار', translationRu: 'жарко' },
    { word: 'Cold', emoji: '🥶', translation: 'קר', translationAr: 'بارد', translationRu: 'холодно' },
    { word: 'Rainbow', emoji: '🌈', translation: 'קשת', translationAr: 'قوس قزح', translationRu: 'радуга' },
    { word: 'Star', emoji: '⭐', translation: 'כוכב', translationAr: 'نجمة', translationRu: 'звезда' },
    { word: 'Moon', emoji: '🌙', translation: 'ירח', translationAr: 'قمر', translationRu: 'луна' },
  ],
  home: [
    { word: 'House', emoji: '🏠', translation: 'בית', translationAr: 'بيت', translationRu: 'дом' },
    { word: 'Door', emoji: '🚪', translation: 'דלת', translationAr: 'باب', translationRu: 'дверь' },
    { word: 'Window', emoji: '🪟', translation: 'חלון', translationAr: 'نافذة', translationRu: 'окно' },
    { word: 'Bed', emoji: '🛏️', translation: 'מיטה', translationAr: 'سرير', translationRu: 'кровать' },
    { word: 'Kitchen', emoji: '🍳', translation: 'מטבח', translationAr: 'مطبخ', translationRu: 'кухня' },
    { word: 'Garden', emoji: '🌳', translation: 'גינה', translationAr: 'حديقة', translationRu: 'сад' },
    { word: 'Key', emoji: '🔑', translation: 'מפתח', translationAr: 'مفتاح', translationRu: 'ключ' },
    { word: 'Light', emoji: '💡', translation: 'אור', translationAr: 'ضوء', translationRu: 'свет' },
    { word: 'Bathroom', emoji: '🚿', translation: 'חדר אמבטיה', translationAr: 'حمام', translationRu: 'ванная' },
    { word: 'Television', emoji: '📺', translation: 'טלוויזיה', translationAr: 'تلفزيون', translationRu: 'телевизор' },
  ],
  clothes: [
    { word: 'Shirt', emoji: '👕', translation: 'חולצה', translationAr: 'قميص', translationRu: 'рубашка' },
    { word: 'Pants', emoji: '👖', translation: 'מכנסיים', translationAr: 'بنطلون', translationRu: 'штаны' },
    { word: 'Shoes', emoji: '👟', translation: 'נעליים', translationAr: 'حذاء', translationRu: 'обувь' },
    { word: 'Hat', emoji: '🧢', translation: 'כובע', translationAr: 'قبعة', translationRu: 'шляпа' },
    { word: 'Dress', emoji: '👗', translation: 'שמלה', translationAr: 'فستان', translationRu: 'платье' },
    { word: 'Socks', emoji: '🧦', translation: 'גרביים', translationAr: 'جوارب', translationRu: 'носки' },
    { word: 'Jacket', emoji: '🧥', translation: "ז'קט", translationAr: 'جاكيت', translationRu: 'куртка' },
    { word: 'Scarf', emoji: '🧣', translation: 'צעיף', translationAr: 'وشاح', translationRu: 'шарф' },
    { word: 'Glasses', emoji: '👓', translation: 'משקפיים', translationAr: 'نظارة', translationRu: 'очки' },
    { word: 'Watch', emoji: '⌚', translation: 'שעון יד', translationAr: 'ساعة يد', translationRu: 'часы' },
  ],
  transport: [
    { word: 'Car', emoji: '🚗', translation: 'מכונית', translationAr: 'سيارة', translationRu: 'машина' },
    { word: 'Bus', emoji: '🚌', translation: 'אוטובוס', translationAr: 'حافلة', translationRu: 'автобус' },
    { word: 'Train', emoji: '🚂', translation: 'רכבת', translationAr: 'قطار', translationRu: 'поезд' },
    { word: 'Airplane', emoji: '✈️', translation: 'מטוס', translationAr: 'طائرة', translationRu: 'самолёт' },
    { word: 'Bicycle', emoji: '🚲', translation: 'אופניים', translationAr: 'دراجة', translationRu: 'велосипед' },
    { word: 'Ship', emoji: '🚢', translation: 'ספינה', translationAr: 'سفينة', translationRu: 'корабль' },
    { word: 'Helicopter', emoji: '🚁', translation: 'מסוק', translationAr: 'مروحية', translationRu: 'вертолёт' },
    { word: 'Truck', emoji: '🚛', translation: 'משאית', translationAr: 'شاحنة', translationRu: 'грузовик' },
    { word: 'Motorcycle', emoji: '🏍️', translation: 'אופנוע', translationAr: 'دراجة نارية', translationRu: 'мотоцикл' },
    { word: 'Taxi', emoji: '🚕', translation: 'מונית', translationAr: 'تاكسي', translationRu: 'такси' },
  ],
  nature: [
    { word: 'Tree', emoji: '🌳', translation: 'עץ', translationAr: 'شجرة', translationRu: 'дерево' },
    { word: 'Flower', emoji: '🌸', translation: 'פרח', translationAr: 'زهرة', translationRu: 'цветок' },
    { word: 'Mountain', emoji: '🏔️', translation: 'הר', translationAr: 'جبل', translationRu: 'гора' },
    { word: 'Sea', emoji: '🌊', translation: 'ים', translationAr: 'بحر', translationRu: 'море' },
    { word: 'River', emoji: '🏞️', translation: 'נהר', translationAr: 'نهر', translationRu: 'река' },
    { word: 'Forest', emoji: '🌲', translation: 'יער', translationAr: 'غابة', translationRu: 'лес' },
    { word: 'Desert', emoji: '🏜️', translation: 'מדבר', translationAr: 'صحراء', translationRu: 'пустыня' },
    { word: 'Lake', emoji: '🏞️', translation: 'אגם', translationAr: 'بحيرة', translationRu: 'озеро' },
    { word: 'Sky', emoji: '🌤️', translation: 'שמיים', translationAr: 'سماء', translationRu: 'небо' },
    { word: 'Rock', emoji: '🪨', translation: 'סלע', translationAr: 'صخرة', translationRu: 'камень' },
  ],
  daily_routine: [
    { word: 'Wake up', emoji: '⏰', translation: 'להתעורר', translationAr: 'الاستيقاظ', translationRu: 'просыпаться' },
    { word: 'Eat', emoji: '🍽️', translation: 'לאכול', translationAr: 'يأكل', translationRu: 'есть' },
    { word: 'Drink', emoji: '🥤', translation: 'לשתות', translationAr: 'يشرب', translationRu: 'пить' },
    { word: 'Sleep', emoji: '😴', translation: 'לישון', translationAr: 'ينام', translationRu: 'спать' },
    { word: 'Play', emoji: '🎮', translation: 'לשחק', translationAr: 'يلعب', translationRu: 'играть' },
    { word: 'Read', emoji: '📖', translation: 'לקרוא', translationAr: 'يقرأ', translationRu: 'читать' },
    { word: 'Write', emoji: '✍️', translation: 'לכתוב', translationAr: 'يكتب', translationRu: 'писать' },
    { word: 'Run', emoji: '🏃', translation: 'לרוץ', translationAr: 'يركض', translationRu: 'бегать' },
    { word: 'Walk', emoji: '🚶', translation: 'ללכת', translationAr: 'يمشي', translationRu: 'ходить' },
    { word: 'Sing', emoji: '🎤', translation: 'לשיר', translationAr: 'يغني', translationRu: 'петь' },
  ],
  store: [
    { word: 'Money', emoji: '💰', translation: 'כסף', translationAr: 'مال', translationRu: 'деньги' },
    { word: 'Price', emoji: '🏷️', translation: 'מחיר', translationAr: 'سعر', translationRu: 'цена' },
    { word: 'Buy', emoji: '🛒', translation: 'לקנות', translationAr: 'يشتري', translationRu: 'покупать' },
    { word: 'Shop', emoji: '🏪', translation: 'חנות', translationAr: 'متجر', translationRu: 'магазин' },
    { word: 'Gift', emoji: '🎁', translation: 'מתנה', translationAr: 'هدية', translationRu: 'подарок' },
    { word: 'Toy', emoji: '🧸', translation: 'צעצוע', translationAr: 'لعبة', translationRu: 'игрушка' },
    { word: 'Candy', emoji: '🍬', translation: 'סוכרייה', translationAr: 'حلوى', translationRu: 'конфета' },
    { word: 'Chocolate', emoji: '🍫', translation: 'שוקולד', translationAr: 'شوكولاتة', translationRu: 'шоколад' },
    { word: 'Bag', emoji: '🛍️', translation: 'שקית', translationAr: 'كيس', translationRu: 'пакет' },
    { word: 'Sell', emoji: '💵', translation: 'למכור', translationAr: 'يبيع', translationRu: 'продавать' },
  ],
  hobbies: [
    { word: 'Draw', emoji: '🎨', translation: 'לצייר', translationAr: 'يرسم', translationRu: 'рисовать' },
    { word: 'Dance', emoji: '💃', translation: 'לרקוד', translationAr: 'يرقص', translationRu: 'танцевать' },
    { word: 'Swim', emoji: '🏊', translation: 'לשחות', translationAr: 'يسبح', translationRu: 'плавать' },
    { word: 'Cook', emoji: '👨‍🍳', translation: 'לבשל', translationAr: 'يطبخ', translationRu: 'готовить' },
    { word: 'Music', emoji: '🎵', translation: 'מוזיקה', translationAr: 'موسيقى', translationRu: 'музыка' },
    { word: 'Soccer', emoji: '⚽', translation: 'כדורגל', translationAr: 'كرة القدم', translationRu: 'футбол' },
    { word: 'Basketball', emoji: '🏀', translation: 'כדורסל', translationAr: 'كرة السلة', translationRu: 'баскетбол' },
    { word: 'Tennis', emoji: '🎾', translation: 'טניס', translationAr: 'تنس', translationRu: 'теннис' },
    { word: 'Photo', emoji: '📸', translation: 'צילום', translationAr: 'تصوير', translationRu: 'фото' },
    { word: 'Game', emoji: '🎲', translation: 'משחק', translationAr: 'لعبة', translationRu: 'игра' },
  ],
  verbs: [
    { word: 'Go', emoji: '🚶', translation: 'ללכת', translationAr: 'يذهب', translationRu: 'идти' },
    { word: 'Come', emoji: '🏃', translation: 'לבוא', translationAr: 'يأتي', translationRu: 'приходить' },
    { word: 'See', emoji: '👀', translation: 'לראות', translationAr: 'يرى', translationRu: 'видеть' },
    { word: 'Hear', emoji: '👂', translation: 'לשמוע', translationAr: 'يسمع', translationRu: 'слышать' },
    { word: 'Talk', emoji: '🗣️', translation: 'לדבר', translationAr: 'يتحدث', translationRu: 'говорить' },
    { word: 'Think', emoji: '🤔', translation: 'לחשוב', translationAr: 'يفكر', translationRu: 'думать' },
    { word: 'Love', emoji: '❤️', translation: 'לאהוב', translationAr: 'يحب', translationRu: 'любить' },
    { word: 'Want', emoji: '🤞', translation: 'לרצות', translationAr: 'يريد', translationRu: 'хотеть' },
    { word: 'Know', emoji: '🧠', translation: 'לדעת', translationAr: 'يعرف', translationRu: 'знать' },
    { word: 'Make', emoji: '🔨', translation: 'לעשות', translationAr: 'يصنع', translationRu: 'делать' },
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

function generateExercises(topicId, uiLang = 'he') {
  const words = TOPIC_WORDS[topicId] || TOPIC_WORDS.colors;
  const exercises = [];
  const shuffled = shuffle(words);
  const types = shuffle(['emoji-pick','word-to-hebrew','listen-pick','fill-letter','emoji-pick','word-to-hebrew','speak-word','listen-pick']);
  const getTranslation = (w) => lf(w, 'translation', uiLang);
  for (let i = 0; i < 8; i++) {
    const target = shuffled[i % shuffled.length];
    const distractors = shuffle(words.filter(w => w.word !== target.word)).slice(0, 3);
    const type = types[i];
    if (type === 'emoji-pick') {
      exercises.push({ type, question: target.word, correctAnswer: target.emoji,
        options: shuffle([target, ...distractors]).map(w => ({ emoji: w.emoji, word: w.word })), wordData: target });
    } else if (type === 'word-to-hebrew') {
      exercises.push({ type, question: target.word, correctAnswer: getTranslation(target),
        options: shuffle([target, ...distractors]).map(w => getTranslation(w)), wordData: target });
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
  const { addXP, progress: userProgress, updateProgress } = useUserProgress();
  const { speak, speakSequence } = useSpeech();
  const { speakWordPair } = useSpeechSynthesis();
  const isRTL = RTL_LANGS.includes(uiLang);

  const { isLocked } = useContentGate();
  const [showPaywall, setShowPaywall] = useState(false);

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
    setExercises(generateExercises(topic.id, uiLang));
    setPhase('intro');
    setTeacherState('talking');
    const topicName = lf(topic, 'title', uiLang);
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
        // Increment lesson counter for achievements
        updateProgress({
          totalLessonsCompleted: (userProgress.totalLessonsCompleted || 0) + 1,
          ...(score === exercises.length ? { perfectLessons: (userProgress.perfectLessons || 0) + 1 } : {}),
        });
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
          titleAr="التدريب مع سبيكلي!"
          titleRu="Практика со Спикли!"
          desc="Hi! Let's practice English together! Let's start!"
          descHe="היי! בואו נתרגל יחד אנגלית! בואו נתחיל!"
          descAr="مرحباً! لنتدرب معاً على الإنجليزية! لنبدأ!"
          descRu="Привет! Давайте вместе практиковать английский! Поехали!"
          uiLang={uiLang}
          gradient="from-purple-500 via-violet-500 to-fuchsia-500"
          buttonLabel="Let's practice!"
          buttonLabelHe="בואו נתרגל!"
          buttonLabelAr="لنتدرب!"
          buttonLabelRu="Практикуем!"
        />
        <div className="flex items-center gap-3 mb-4" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <button onClick={goBack} className="glass-card w-10 h-10 rounded-xl flex items-center justify-center text-xl">{isRTL ? '→' : '←'}</button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('teacherTime', uiLang)}</h1>
        </div>
        <div className="flex flex-col items-center mb-5">
          <SpeakliAvatar mode={teacherState === 'celebrating' ? 'celebrate' : teacherState === 'talking' ? 'talk' : 'idle'} size="xl" />
          <SpeechBubble text={speechText} direction={isRTL ? 'rtl' : 'ltr'} visible={showSpeech} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEACHER_TOPICS.map((topic, i) => {
            const locked = isLocked('teacherTopics', i);
            return (
              <button key={topic.id} onClick={() => {
                if (locked) { setShowPaywall(true); return; }
                handleTopicSelect(topic);
              }}
                className={`rounded-2xl p-4 flex flex-col items-center gap-1 active:scale-95 transition-transform shadow-lg relative ${locked ? 'opacity-60' : ''}`}
                style={{ background: locked ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : topic.gradient }}>
                {locked && (
                  <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1.5">
                    <Lock size={14} className="text-white" />
                  </div>
                )}
                <span className="text-3xl">{topic.emoji}</span>
                <span className="text-sm font-bold text-white drop-shadow">{isRTL ? topic.titleHe : topic.titleEn}</span>
                <span className="text-xs text-white/80">Level {topic.level}</span>
              </button>
            );
          })}
        </div>

        {showPaywall && <PaywallModal feature="teacherTopics" onClose={() => setShowPaywall(false)} onNavigate={() => {}} />}
      </div>
    );
  }

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-5">
        <SpeakliAvatar mode="talk" size="xl" />
        <SpeechBubble text={speechText} direction={isRTL ? 'rtl' : 'ltr'} />
        <div className="mt-8 rounded-3xl p-6 text-center shadow-xl animate-pop-in" style={{ background: selectedTopic.gradient }}>
          <div className="text-5xl">{selectedTopic.emoji}</div>
          <div className="text-xl font-bold text-white drop-shadow mt-2">{lf(selectedTopic, 'title', uiLang)}</div>
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
            <SpeakliAvatar mode={teacherState === 'celebrating' ? 'celebrate' : teacherState === 'talking' ? 'talk' : 'idle'} size="sm" shadow={false} />
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
        <SpeakliAvatar mode="celebrate" size="xl" />
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
                <button key={i} onClick={() => speakWordPair(w.word, lf(w, 'translation', uiLang), uiLang)}
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
