import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStats, createHabit, toggleHabit } from '../src/habitModel.js';

test('calculateStats summarizes habit completion and longest streak', () => {
  const stats = calculateStats([
    { completed: true, streak: 3 },
    { completed: false, streak: 8 },
    { completed: true, streak: 2 },
  ]);

  assert.deepEqual(stats, {
    total: 3,
    completed: 2,
    completionRate: 67,
    longestStreak: 8,
  });
});

test('createHabit normalizes required values and preserves customization', () => {
  const habit = createHabit({
    title: ' Read 10 pages! ',
    category: 'Mind',
    time: '20:00',
    emoji: '📚',
    color: '#abcdef',
  });

  assert.match(habit.id, /^read-10-pages-/);
  assert.equal(habit.title, 'Read 10 pages!');
  assert.equal(habit.category, 'Mind');
  assert.equal(habit.time, '20:00');
  assert.equal(habit.emoji, '📚');
  assert.equal(habit.color, '#abcdef');
  assert.equal(habit.completed, false);
});

test('toggleHabit flips completion and adjusts streak only for selected habit', () => {
  const habits = [
    { id: 'a', completed: false, streak: 1 },
    { id: 'b', completed: true, streak: 5 },
  ];

  const next = toggleHabit(habits, 'a');

  assert.equal(next[0].completed, true);
  assert.equal(next[0].streak, 2);
  assert.deepEqual(next[1], habits[1]);
});
