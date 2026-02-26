import React, { useState } from 'react';
import Modal from '../shared/Modal.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { t } from '../../utils/translations.js';

const AVATARS = ['🦁', '🐱', '🐶', '🦊', '🐰', '🐼', '🦄', '🐸', '🦋', '🐝', '🐳', '🦀', '🦖', '🐵', '🦉', '🐧'];

const COLORS = [
  'from-pink-400 to-rose-500',
  'from-purple-400 to-indigo-500',
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-red-400 to-pink-500',
];

export default function AddChildModal({ isOpen, onClose, onSubmit, editData }) {
  const { uiLang } = useTheme();
  const [name, setName] = useState(editData?.name || '');
  const [age, setAge] = useState(editData?.age || '');
  const [pin, setPin] = useState('');
  const [confirmPinVal, setConfirmPinVal] = useState('');
  const [pinError, setPinError] = useState('');
  const [avatar, setAvatar] = useState(editData?.avatar || AVATARS[0]);
  const [avatarColor, setAvatarColor] = useState(editData?.avatarColor || COLORS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    // Validate PIN (required for new children, optional for edit)
    if (!editData) {
      if (pin.length !== 4) return;
      if (pin !== confirmPinVal) {
        setPinError(t('pinMismatch', uiLang));
        return;
      }
    }

    setPinError('');
    onSubmit({
      name: name.trim(),
      avatar,
      avatarColor,
      age: age ? parseInt(age, 10) : null,
      ...(pin && { pin }),
    });

    if (!editData) {
      setName('');
      setAge('');
      setPin('');
      setConfirmPinVal('');
      setAvatar(AVATARS[0]);
      setAvatarColor(COLORS[0]);
    }
    onClose();
  };

  const title = editData ? t('editChild', uiLang) : t('addChild', uiLang);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('childName', uiLang)}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('childName', uiLang)}
            maxLength={20}
            className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('childAge', uiLang)}
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="4-12"
            min={4}
            max={17}
            className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
        </div>

        {/* PIN - 4 digit boxes */}
        {!editData && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('setPin', uiLang)}
              </label>
              <div className="flex justify-center gap-3" dir="ltr">
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={`pin-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newPin = pin.split('');
                      newPin[i] = val;
                      setPin(newPin.join('').slice(0, 4));
                      if (val && i < 3) {
                        e.target.nextElementSibling?.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !pin[i] && i > 0) {
                        e.target.previousElementSibling?.focus();
                      }
                    }}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl bg-white/50 dark:bg-white/5 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('confirmPin', uiLang)}
              </label>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={`cpin-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={confirmPinVal[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newPin = confirmPinVal.split('');
                      newPin[i] = val;
                      setConfirmPinVal(newPin.join('').slice(0, 4));
                      if (val && i < 3) {
                        e.target.nextElementSibling?.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !confirmPinVal[i] && i > 0) {
                        e.target.previousElementSibling?.focus();
                      }
                    }}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-xl bg-white/50 dark:bg-white/5 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                ))}
              </div>
              {pinError && (
                <p className="text-red-500 text-sm mt-1 text-center">{pinError}</p>
              )}
            </div>
          </>
        )}

        {/* Avatar Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('chooseAvatar', uiLang)}
          </label>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setAvatar(emoji)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all ${
                  avatar === emoji
                    ? 'bg-brand-100 dark:bg-brand-900/40 ring-2 ring-brand-500 scale-110'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('chooseColor', uiLang)}
          </label>
          <div className="flex gap-3">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setAvatarColor(color)}
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} transition-all ${
                  avatarColor === color
                    ? 'ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-gray-900 scale-110'
                    : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-3xl shadow-lg`}>
            {avatar}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || (!editData && pin.length !== 4)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {editData ? t('save', uiLang) : t('addChild', uiLang)}
        </button>
      </div>
    </Modal>
  );
}
