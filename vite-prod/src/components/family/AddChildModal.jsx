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
  const [avatar, setAvatar] = useState(editData?.avatar || AVATARS[0]);
  const [avatarColor, setAvatarColor] = useState(editData?.avatarColor || COLORS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), avatar, avatarColor });
    if (!editData) {
      setName('');
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
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {editData ? t('save', uiLang) : t('addChild', uiLang)}
        </button>
      </div>
    </Modal>
  );
}
