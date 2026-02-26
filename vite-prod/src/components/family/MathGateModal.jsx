import React, { useState, useCallback, useEffect } from 'react';
import Modal from '../shared/Modal.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { t } from '../../utils/translations.js';

function generateMathQuestion() {
  const type = Math.floor(Math.random() * 3);
  if (type === 0) {
    // Multiplication: 10-99 x 2-9
    const a = Math.floor(Math.random() * 90) + 10;
    const b = Math.floor(Math.random() * 8) + 2;
    return { question: `${a} × ${b} = ?`, answer: a * b };
  } else if (type === 1) {
    // Division: result 10-49
    const b = Math.floor(Math.random() * 8) + 2;
    const result = Math.floor(Math.random() * 40) + 10;
    return { question: `${result * b} ÷ ${b} = ?`, answer: result };
  } else {
    // Addition: 50-99 + 30-99
    const a = Math.floor(Math.random() * 50) + 50;
    const b = Math.floor(Math.random() * 70) + 30;
    return { question: `${a} + ${b} = ?`, answer: a + b };
  }
}

export default function MathGateModal({ isOpen, onClose, onSuccess }) {
  const { uiLang } = useTheme();
  const [question, setQuestion] = useState(() => generateMathQuestion());
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuestion(generateMathQuestion());
      setAnswer('');
      setError(false);
    }
  }, [isOpen]);

  const handleCheck = useCallback(() => {
    if (parseInt(answer, 10) === question.answer) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => {
        setQuestion(generateMathQuestion());
        setAnswer('');
        setError(false);
      }, 1200);
    }
  }, [answer, question, onSuccess]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('solveToReturn', uiLang)}>
      <div className="space-y-5 py-2">
        {/* Question */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {t('mathQuestion', uiLang)}
          </p>
          <div className="text-4xl font-bold text-gray-900 dark:text-white py-4">
            {question.question}
          </div>
        </div>

        {/* Answer input */}
        <input
          type="number"
          inputMode="numeric"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && answer && handleCheck()}
          placeholder="?"
          autoFocus
          className={`w-full text-center text-3xl font-bold py-4 rounded-2xl border-2 outline-none transition-all ${
            error
              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
              : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-white/5 focus:border-brand-500'
          }`}
        />

        {/* Error message */}
        {error && (
          <p className="text-center text-red-500 font-medium animate-pulse">
            {t('wrongAnswer', uiLang)}
          </p>
        )}

        {/* Check button */}
        <button
          onClick={handleCheck}
          disabled={!answer}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('checkAnswer', uiLang)}
        </button>
      </div>
    </Modal>
  );
}
