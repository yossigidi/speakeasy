import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Play, Pencil, Trash2, Plus, Flame, Zap, Copy, Check, Share2, Key, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t, lf } from '../utils/translations.js';
import { LEVEL_INFO } from '../data/kids-vocabulary.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import AddChildModal from '../components/family/AddChildModal.jsx';
import Modal from '../components/shared/Modal.jsx';

function formatLastActive(dateStr, uiLang) {
  if (!dateStr) return t('notYetActive', uiLang);
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return t('activeToday', uiLang);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().split('T')[0]) return t('yesterday', uiLang);
  return `${t('lastActive', uiLang)} ${dateStr}`;
}

export default function FamilyPage({ onNavigate }) {
  const { uiLang, dir } = useTheme();
  const { children, switchToChild, addChild, updateChild, deleteChild, familyCode, generateFamilyCode, resetChildPin, updateChildLevel } = useUserProgress();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [deletingChild, setDeletingChild] = useState(null);
  const [copied, setCopied] = useState(false);
  const [resetPinChild, setResetPinChild] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinResetError, setPinResetError] = useState('');
  const [pinResetSuccess, setPinResetSuccess] = useState(false);
  const copyTimerRef = useRef(null);
  const pinTimerRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => () => { clearTimeout(copyTimerRef.current); clearTimeout(pinTimerRef.current); }, []);

  const handlePlay = (childId) => {
    switchToChild(childId);
    onNavigate('home');
  };

  const handleAdd = async (data) => {
    await addChild(data);
  };

  const handleEdit = async (data) => {
    if (!editingChild) return;
    await updateChild(editingChild.id, data);
    setEditingChild(null);
  };

  const handleDelete = async () => {
    if (!deletingChild) return;
    await deleteChild(deletingChild.id);
    setDeletingChild(null);
  };

  const handleCopyCode = async () => {
    let code = familyCode;
    if (!code) {
      code = await generateFamilyCode();
    }
    if (code) {
      navigator.clipboard.writeText(code).catch(() => {});
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareCode = async () => {
    let code = familyCode;
    if (!code) {
      code = await generateFamilyCode();
    }
    if (code && navigator.share) {
      try {
        await navigator.share({
          title: 'Speakli',
          text: `${t('familyCodeDesc', uiLang)}: ${code}`,
          url: `${window.location.origin}?childJoin=${code}`,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopyCode();
    }
  };

  const handleResetPin = async () => {
    if (!resetPinChild) return;
    if (newPin.length !== 4) return;
    if (newPin !== confirmNewPin) {
      setPinResetError(t('pinMismatch', uiLang));
      return;
    }
    try {
      await resetChildPin(resetPinChild.id, resetPinChild.name, newPin);
      setPinResetSuccess(true);
      pinTimerRef.current = setTimeout(() => {
        setResetPinChild(null);
        setNewPin('');
        setConfirmNewPin('');
        setPinResetError('');
        setPinResetSuccess(false);
      }, 1500);
    } catch (e) {
      setPinResetError(e.message);
    }
  };

  return (
    <div className="pb-24 px-4 pt-2 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => onNavigate('profile')}
          aria-label="Back"
          className="p-1.5 ltr:-ml-1.5 rtl:-mr-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={22} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('myFamily', uiLang)}
        </h1>
      </div>

      {/* Family Code Section */}
      <GlassCard variant="strong" className="!p-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('yourFamilyCode', uiLang)}
          </p>
          {familyCode ? (
            <div className="text-3xl font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              {familyCode}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {t('codeWillBeCreated', uiLang)}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {t('familyCodeDesc', uiLang)}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t('copied', uiLang) : t('copyCode', uiLang)}
            </button>
            <button
              onClick={handleShareCode}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors"
            >
              <Share2 size={16} />
              {t('shareCode', uiLang)}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Children Cards */}
      {children.map(child => (
        <GlassCard key={child.id} variant="strong" className="!p-0 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${child.avatarColor} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                {child.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {child.name}
                  {child.age && (
                    <span className="text-sm font-normal text-gray-400 mx-1">({child.age})</span>
                  )}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Zap size={14} className="text-brand-500" />
                    {child.xp || 0} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={14} className={child.streak > 0 ? 'text-orange-500' : 'text-gray-400'} />
                    {child.streak || 0}
                  </span>
                  <span>{t('level', uiLang)} {child.level || 1}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatLastActive(child.lastActiveDate, uiLang)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onNavigate('child-progress', child.id)}
                  className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-gray-400 hover:text-indigo-500"
                  title={t('viewProgress', uiLang)}
                  aria-label={t('viewProgress', uiLang) || 'View progress'}
                >
                  <BarChart3 size={16} />
                </button>
                <button
                  onClick={() => setResetPinChild(child)}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-400"
                  title={t('resetPin', uiLang)}
                  aria-label={t('resetPin', uiLang) || 'Reset PIN'}
                >
                  <Key size={16} />
                </button>
                <button
                  onClick={() => setEditingChild(child)}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-400"
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeletingChild(child)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-500"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Child Level Selector */}
          {child.age && parseInt(child.age, 10) < 10 && (
            <div className="px-4 pb-3 pt-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('childLevel', uiLang)}
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(lvl => {
                  const info = LEVEL_INFO[lvl];
                  const isActive = (child.curriculumLevel || child.childLevel || 1) === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => updateChildLevel(child.id, lvl)}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-center transition-all text-xs font-bold ${
                        isActive
                          ? `bg-gradient-to-r ${info.color} text-white shadow-md scale-105`
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="block text-sm">{info.emoji}</span>
                      <span className="block leading-tight" style={{ fontSize: '9px' }}>
                        {lf(info, 'name', uiLang)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Play Button */}
          <button
            onClick={() => handlePlay(child.id)}
            className="w-full py-2.5 bg-gradient-to-r from-brand-500/10 to-emerald-500/10 dark:from-brand-500/20 dark:to-emerald-500/20 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm hover:from-brand-500/20 hover:to-emerald-500/20 transition-all"
          >
            <Play size={16} fill="currentColor" />
            {t('playAs', uiLang)} {child.name}
          </button>
        </GlassCard>
      ))}

      {/* Add Child Card */}
      <GlassCard
        className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 !bg-transparent hover:border-brand-400 dark:hover:border-brand-500 transition-colors"
        onClick={() => setShowAddModal(true)}
      >
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Plus size={28} className="text-gray-400" />
          </div>
          <span className="font-medium text-gray-500 dark:text-gray-400">
            {t('addChild', uiLang)}
          </span>
        </div>
      </GlassCard>

      {/* Add Modal */}
      <AddChildModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
      />

      {/* Edit Modal */}
      {editingChild && (
        <AddChildModal
          isOpen={true}
          onClose={() => setEditingChild(null)}
          onSubmit={handleEdit}
          editData={editingChild}
        />
      )}

      {/* Delete Confirmation */}
      {deletingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeletingChild(null)}>
          <div
            className="glass-card-strong w-full max-w-sm p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('deleteChild', uiLang)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('deleteChildConfirm', uiLang)} <strong>{deletingChild.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingChild(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300"
              >
                {t('cancel', uiLang)}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium"
              >
                {t('delete', uiLang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset PIN Modal */}
      {resetPinChild && (
        <Modal
          isOpen={true}
          onClose={() => {
            setResetPinChild(null);
            setNewPin('');
            setConfirmNewPin('');
            setPinResetError('');
            setPinResetSuccess(false);
          }}
          title={`${t('resetPin', uiLang)} - ${resetPinChild.name}`}
        >
          <div className="space-y-4">
            {pinResetSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <Check size={32} className="text-green-500" />
                </div>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {t('pinResetSuccess', uiLang)}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('setPin', uiLang)}
                  </label>
                  <div className="flex justify-center gap-3" dir="ltr">
                    {[0, 1, 2, 3].map(i => (
                      <input
                        key={`rpin-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={newPin[i] || ''}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          const p = newPin.split('');
                          p[i] = val;
                          setNewPin(p.join('').slice(0, 4));
                          if (val && i < 3) e.target.nextElementSibling?.focus();
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && !newPin[i] && i > 0) e.target.previousElementSibling?.focus();
                        }}
                        className="w-14 h-14 text-center text-2xl font-bold rounded-xl bg-white/50 dark:bg-white/5 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none transition-colors"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('confirmPin', uiLang)}
                  </label>
                  <div className="flex justify-center gap-3" dir="ltr">
                    {[0, 1, 2, 3].map(i => (
                      <input
                        key={`rcpin-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={confirmNewPin[i] || ''}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          const p = confirmNewPin.split('');
                          p[i] = val;
                          setConfirmNewPin(p.join('').slice(0, 4));
                          if (val && i < 3) e.target.nextElementSibling?.focus();
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && !confirmNewPin[i] && i > 0) e.target.previousElementSibling?.focus();
                        }}
                        className="w-14 h-14 text-center text-2xl font-bold rounded-xl bg-white/50 dark:bg-white/5 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none transition-colors"
                      />
                    ))}
                  </div>
                </div>

                {pinResetError && (
                  <p className="text-red-500 text-sm text-center">{pinResetError}</p>
                )}

                <button
                  onClick={handleResetPin}
                  disabled={newPin.length !== 4}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 text-white font-bold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('resetPin', uiLang)}
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
