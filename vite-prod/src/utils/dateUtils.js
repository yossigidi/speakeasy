export function getToday() {
  return new Date().toISOString().split('T')[0];
}

export function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function isToday(dateStr) {
  return dateStr === getToday();
}

export function isYesterday(dateStr) {
  return dateStr === getYesterday();
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2 - d1);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr, lang = 'en') {
  const date = new Date(dateStr);
  return date.toLocaleDateString(({ he: 'he-IL', ar: 'ar-SA', ru: 'ru-RU' }[lang] || 'en-US'), {
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(seconds) {
  seconds = Math.floor(seconds);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
