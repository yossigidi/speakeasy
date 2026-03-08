import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { t, lf } from '../utils/translations.js';
import { SKILLS, SKILL_LEVELS } from '../data/skills/skills-data.js';
import { LESSON_TYPES } from '../data/curriculum/curriculum-index.js';
import useSkillsProgress from '../hooks/useSkillsProgress.js';
import SkillsLessonRunner from '../components/skills/SkillsLessonRunner.jsx';
import useContentGate from '../hooks/useContentGate.js';
import PaywallModal from '../components/subscription/PaywallModal.jsx';

export default function SkillsPage({ onBack }) {
  const { uiLang, dir } = useTheme();
  const { skills, isSkillLessonUnlocked, getLessonResult, getSkillProgress } = useSkillsProgress();
  const { isLocked: isContentLocked } = useContentGate();
  const [activeLesson, setActiveLesson] = useState(null);
  const [bottomSheet, setBottomSheet] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // If running a lesson, show the lesson runner full-screen
  if (activeLesson) {
    return (
      <SkillsLessonRunner
        lessonId={activeLesson}
        onComplete={() => setActiveLesson(null)}
        onBack={() => setActiveLesson(null)}
        uiLang={uiLang}
      />
    );
  }

  const totalStars = skills.totalStars || 0;

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #F0F9FF 0%, #ECFDF5 100%)',
      paddingBottom: 32,
    }}>
      {/* Header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 16px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.1)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} style={{ color: 'white', transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              {t('skillsTitle', uiLang)}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
              {t('skillsSubtitle', uiLang)}
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 12,
          }}>
            <Star size={14} style={{ color: '#FBBF24', fill: '#FBBF24' }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>{totalStars}</span>
          </div>
        </div>
      </div>

      {/* Skills by level */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {SKILL_LEVELS.map(level => {
          const levelSkills = SKILLS.filter(s => s.level === level.id);
          if (levelSkills.length === 0) return null;

          return (
            <div key={level.id}>
              {/* Level header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                direction: dir,
              }}>
                <span style={{ fontSize: 22 }}>{level.emoji}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: level.color }}>
                  {lf(level, 'name', uiLang)}
                </span>
              </div>

              {/* Skill cards */}
              {levelSkills.map((skill, skillIdx) => {
                const progress = getSkillProgress(skill.id);
                const isPremiumLocked = isContentLocked('skills', skillIdx);
                const isLocked = isPremiumLocked || !isSkillLessonUnlocked(skill.lessons[0].id);

                return (
                  <div
                    key={skill.id}
                    onClick={isPremiumLocked ? () => setShowPaywall(true) : undefined}
                    style={{
                      background: 'white', borderRadius: 20, padding: '20px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      marginBottom: 12, position: 'relative',
                      opacity: isLocked ? 0.5 : 1,
                      transition: 'all 0.3s',
                      cursor: isPremiumLocked ? 'pointer' : undefined,
                    }}
                  >
                    {/* Lock overlay */}
                    {isLocked && (
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: 20,
                        background: 'rgba(255,255,255,0.5)', zIndex: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{
                          background: isPremiumLocked ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#F3F4F6',
                          borderRadius: '50%', padding: 12,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}>
                          <Lock size={24} style={{ color: isPremiumLocked ? 'white' : '#9CA3AF' }} />
                        </div>
                      </div>
                    )}

                    {/* Skill header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, direction: dir }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 16,
                        background: `linear-gradient(135deg, ${level.color}22, ${level.color}44)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26,
                      }}>
                        {skill.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#1F2937' }}>
                          {lf(skill, 'title', uiLang)}
                        </div>
                        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                          {lf(skill, 'desc', uiLang)}
                        </div>
                      </div>
                      {progress.isComplete && (
                        <div style={{ fontSize: 22 }}>✅</div>
                      )}
                    </div>

                    {/* Lesson progress row */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      {skill.lessons.map((lesson, li) => {
                        const result = getLessonResult(lesson.id);
                        const unlocked = isSkillLessonUnlocked(lesson.id);
                        const typeInfo = LESSON_TYPES[lesson.type] || LESSON_TYPES.mixed;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (!unlocked) return;
                              setBottomSheet({ skill, lesson, result, typeInfo });
                            }}
                            style={{
                              flex: 1, padding: '10px 4px', borderRadius: 12,
                              border: result?.completed ? `2px solid ${typeInfo.color}` : '2px solid #E5E7EB',
                              background: result?.completed ? `${typeInfo.color}11` : unlocked ? '#FAFAFA' : '#F3F4F6',
                              cursor: unlocked ? 'pointer' : 'default',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                              transition: 'all 0.2s',
                              opacity: unlocked ? 1 : 0.4,
                            }}
                          >
                            <span style={{ fontSize: 18 }}>
                              {!unlocked ? '🔒' : typeInfo.icon}
                            </span>
                            <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7280', textAlign: 'center' }}>
                              {li + 1}
                            </div>
                            {result?.completed && (
                              <div style={{ display: 'flex', gap: 1 }}>
                                {[1, 2, 3].map(s => (
                                  <span key={s} style={{ fontSize: 8, opacity: s <= (result.stars || 0) ? 1 : 0.2 }}>⭐</span>
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Progress text */}
                    <div style={{ marginTop: 10, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                      {progress.completed}/{progress.total} {t('lessons', uiLang)} · {progress.totalStars} ⭐
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Sheet */}
      {bottomSheet && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setBottomSheet(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
              animation: 'sheet-fade-in 0.2s ease',
            }}
          />

          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
            background: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: '24px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
            animation: 'sheet-slide-up 0.3s ease',
          }}>
            <button
              onClick={() => setBottomSheet(null)}
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: '#F3F4F6', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} style={{ color: '#9CA3AF' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{bottomSheet.typeInfo.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2937' }}>
                  {lf(bottomSheet.lesson, 'title', uiLang)}
                </div>
                <div style={{ fontSize: 13, color: bottomSheet.typeInfo.color, fontWeight: 600 }}>
                  {lf(bottomSheet.typeInfo, 'name', uiLang)}
                </div>
              </div>
            </div>

            {bottomSheet.result?.completed && (
              <div style={{
                display: 'flex', gap: 12, marginBottom: 16, padding: '10px 14px',
                background: '#F0FDF4', borderRadius: 12,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{t('accuracy', uiLang)}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>
                    {Math.round(bottomSheet.result.bestAccuracy || 0)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{t('lessonStars', uiLang)}</div>
                  <div style={{ fontSize: 16 }}>
                    {[1, 2, 3].map(s => (
                      <span key={s} style={{ opacity: s <= (bottomSheet.result.stars || 0) ? 1 : 0.2 }}>⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                const lid = bottomSheet.lesson.id;
                setBottomSheet(null);
                setActiveLesson(lid);
              }}
              style={{
                width: '100%', padding: '16px', borderRadius: 16,
                fontSize: 17, fontWeight: 700,
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,107,107,0.35)',
                minHeight: 52,
              }}
            >
              {bottomSheet.result?.completed
                ? t('playAgain', uiLang)
                : t('startLesson2', uiLang)}
            </button>
          </div>
        </>
      )}

      {showPaywall && <PaywallModal feature="skills" onClose={() => setShowPaywall(false)} onNavigate={() => {}} />}

      <style>{`
        @keyframes sheet-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes sheet-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
