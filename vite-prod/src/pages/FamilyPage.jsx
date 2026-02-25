import React, { useState } from 'react';
import { ChevronLeft, Play, Pencil, Trash2, Plus, Flame, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import AddChildModal from '../components/family/AddChildModal.jsx';

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
  const { children, switchToChild, addChild, updateChild, deleteChild } = useUserProgress();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [deletingChild, setDeletingChild] = useState(null);

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

  return (
    <div className="pb-24 px-4 pt-2 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => onNavigate('profile')}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={22} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('myFamily', uiLang)}
        </h1>
      </div>

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
                  onClick={() => setEditingChild(child)}
                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-400"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeletingChild(child)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={() => handlePlay(child.id)}
            className="w-full py-2.5 bg-gradient-to-r from-brand-500/10 to-purple-500/10 dark:from-brand-500/20 dark:to-purple-500/20 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm hover:from-brand-500/20 hover:to-purple-500/20 transition-all"
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
    </div>
  );
}
