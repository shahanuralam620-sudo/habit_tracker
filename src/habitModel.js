export const routinePacks = [
  {
    id: 'morning-reset',
    title: 'Morning Reset',
    tag: 'Self-care',
    color: '#ffe2a8',
    emoji: '🌞',
    habits: ['Drink water', 'Stretch for 5 minutes', 'Plan top 3 tasks'],
  },
  {
    id: 'adhd-focus',
    title: 'ADHD Focus',
    tag: 'Productivity',
    color: '#ffc6d9',
    emoji: '🎯',
    habits: ['Clear one surface', 'Start a focus timer', 'Celebrate one win'],
  },
  {
    id: 'night-care',
    title: 'Night Care',
    tag: 'Wellbeing',
    color: '#cde7ff',
    emoji: '🌙',
    habits: ['Skincare routine', 'Write a reflection', 'No phone in bed'],
  },
  {
    id: 'home-tidy',
    title: 'Cozy Home',
    tag: 'Cleaning',
    color: '#d7f5d7',
    emoji: '🏡',
    habits: ['Make bed', 'Tidy clothes', 'Reset kitchen sink'],
  },
];

export const seedHabits = [
  {
    id: 'drink-water',
    title: 'Drink water',
    category: 'Body',
    time: '09:00',
    emoji: '💧',
    color: '#6bc6ff',
    streak: 12,
    completed: true,
  },
  {
    id: 'journal',
    title: 'Write daily journal',
    category: 'Mind',
    time: '12:30',
    emoji: '📔',
    color: '#ffcc62',
    streak: 6,
    completed: false,
  },
  {
    id: 'walk',
    title: 'Take a mindful walk',
    category: 'Movement',
    time: '17:45',
    emoji: '🚶',
    color: '#9adba8',
    streak: 21,
    completed: false,
  },
  {
    id: 'skin-care',
    title: 'Night skincare',
    category: 'Self-care',
    time: '21:00',
    emoji: '🧴',
    color: '#ff9cc7',
    streak: 8,
    completed: true,
  },
];

export const journalPrompts = [
  'What made today feel lighter?',
  'Which small promise did you keep for yourself?',
  'What do you want tomorrow-you to remember?',
  'Where did you notice progress, even if it was tiny?',
];

export function calculateStats(habits) {
  const total = habits.length;
  const completed = habits.filter((habit) => habit.completed).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);

  return { total, completed, completionRate, longestStreak };
}

export function createHabit({ title, category, time, emoji, color }) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    id: `${slug || 'habit'}-${Date.now()}`,
    title: title.trim(),
    category: category || 'Personal',
    time: time || '08:00',
    emoji: emoji || '✨',
    color: color || '#ffd1a8',
    streak: 0,
    completed: false,
  };
}

export function toggleHabit(habits, habitId) {
  return habits.map((habit) =>
    habit.id === habitId
      ? {
          ...habit,
          completed: !habit.completed,
          streak: habit.completed ? Math.max(0, habit.streak - 1) : habit.streak + 1,
        }
      : habit,
  );
}
