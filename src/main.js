import { calculateStats, createHabit, routinePacks, seedHabits, toggleHabit } from './habitModel.js';
import {
  defaultLanguage,
  languages,
  localizeImportedRoutineHabit,
  localizeRoutinePack,
  localizeSeedHabit,
  localizedJournalPrompts,
  normalizeLanguage,
  translate,
} from './i18n.js';

const storageKey = 'dear-day-habits-v1';
const languageStorageKey = 'dear-day-language-v1';
const seedHabitIds = new Set(seedHabits.map((habit) => habit.id));
const elements = {
  completedStat: document.querySelector('#completedStat'),
  scoreStat: document.querySelector('#scoreStat'),
  streakStat: document.querySelector('#streakStat'),
  phoneGreeting: document.querySelector('#phoneGreeting'),
  phoneScore: document.querySelector('#phoneScore'),
  phoneDone: document.querySelector('#phoneDone'),
  phoneDoneLabel: document.querySelector('#phoneDoneLabel'),
  progressRing: document.querySelector('#progressRing'),
  miniList: document.querySelector('#miniList'),
  habitList: document.querySelector('#habitList'),
  promptCloud: document.querySelector('#promptCloud'),
  journal: document.querySelector('#journal'),
  routineCards: document.querySelector('#routineCards'),
  routinePreview: document.querySelector('#routinePreview'),
  composerModal: document.querySelector('#composerModal'),
  habitComposer: document.querySelector('#habitComposer'),
  todayLabel: document.querySelector('#todayLabel'),
  languageSelect: document.querySelector('#languageSelect'),
};

let habits = loadHabits();
let currentLanguage = loadLanguage();
let activePackId = routinePacks[0].id;
let journalHasDefaultCopy = elements.journal.value.trim() === translate(defaultLanguage, 'journalDefault');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function t(key) {
  return translate(currentLanguage, key);
}

function loadLanguage() {
  return normalizeLanguage(localStorage.getItem(languageStorageKey) || defaultLanguage);
}

function loadHabits() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : seedHabits;
}

function getLocalizedHabits() {
  return habits.map((habit) => {
    if (seedHabitIds.has(habit.id)) return localizeSeedHabit(habit, currentLanguage);
    return localizeImportedRoutineHabit(habit, currentLanguage);
  });
}

function getLocalizedPacks() {
  return routinePacks.map((pack) => localizeRoutinePack(pack, currentLanguage));
}

function persist(nextHabits) {
  habits = nextHabits;
  localStorage.setItem(storageKey, JSON.stringify(habits));
  render();
}

function applyStaticTranslations() {
  const language = languages[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = language.dir;
  document.title = t('appTitle');
  elements.languageSelect.value = currentLanguage;
  elements.languageSelect.setAttribute('aria-label', t('languageLabel'));

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((node) => {
    node.dataset.i18nAttr.split(',').forEach((pair) => {
      const [attribute, key] = pair.split(':').map((value) => value.trim());
      if (attribute && key) node.setAttribute(attribute, t(key));
    });
  });

  if (journalHasDefaultCopy) elements.journal.value = t('journalDefault');
}

function renderDate() {
  elements.todayLabel.textContent = new Intl.DateTimeFormat(languages[currentLanguage].locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());
}

function render() {
  const stats = calculateStats(habits);
  const localizedHabits = getLocalizedHabits();
  elements.completedStat.textContent = `${stats.completed}/${stats.total}`;
  elements.scoreStat.textContent = `${stats.completionRate}%`;
  elements.streakStat.textContent = `${stats.longestStreak} ${t('days')}`;
  elements.phoneGreeting.textContent = t('phoneGreeting');
  elements.phoneScore.textContent = `${stats.completionRate}% ${t('aligned')}`;
  elements.phoneDone.textContent = stats.completed;
  elements.phoneDoneLabel.textContent = t('done');
  elements.progressRing.style.setProperty('--progress', `${stats.completionRate}%`);

  elements.miniList.innerHTML = localizedHabits
    .slice(0, 4)
    .map(
      (habit) => `
        <div class="${habit.completed ? 'done' : ''}">
          <span>${escapeHtml(habit.emoji)}</span>
          <p>${escapeHtml(habit.title)}</p>
          <b>${habit.completed ? '✓' : escapeHtml(habit.time)}</b>
        </div>`,
    )
    .join('');

  elements.habitList.innerHTML = localizedHabits
    .map(
      (habit) => `
        <button class="habit-row ${habit.completed ? 'is-complete' : ''}" data-habit-id="${habit.id}">
          <span class="habit-emoji" style="background-color:${escapeHtml(habit.color)}">${escapeHtml(habit.emoji)}</span>
          <span>
            <strong>${escapeHtml(habit.title)}</strong>
            <small>${escapeHtml(habit.time)} · ${escapeHtml(habit.category)} · ${habit.streak} ${t('dayStreak')}</small>
          </span>
          <span class="checkmark">✓</span>
        </button>`,
    )
    .join('');

  renderRoutines();
}

function renderPrompts() {
  elements.promptCloud.innerHTML = localizedJournalPrompts[currentLanguage]
    .map((prompt) => `<button type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
    .join('');
}

function renderRoutines() {
  const packs = getLocalizedPacks();
  const activePack = packs.find((pack) => pack.id === activePackId) || packs[0];
  elements.routineCards.innerHTML = packs
    .map(
      (pack) => `
        <button class="routine-card ${activePack.id === pack.id ? 'active' : ''}" style="--card-color:${pack.color}" data-pack-id="${pack.id}">
          <span>${escapeHtml(pack.emoji)}</span>
          <strong>${escapeHtml(pack.title)}</strong>
          <small>${escapeHtml(pack.tag)}</small>
        </button>`,
    )
    .join('');

  elements.routinePreview.style.backgroundColor = activePack.color;
  elements.routinePreview.innerHTML = `
    <p>${escapeHtml(activePack.emoji)} ${escapeHtml(activePack.tag)}</p>
    <h3>${escapeHtml(activePack.title)}</h3>
    <ul>${activePack.habits.map((habit) => `<li>${escapeHtml(habit)}</li>`).join('')}</ul>
    <button class="primary-button" data-add-pack="${activePack.id}">${t('addRoutine')}</button>
  `;
}

function openComposer() {
  elements.composerModal.hidden = false;
  elements.habitComposer.elements.title.focus();
}

function closeComposer() {
  elements.composerModal.hidden = true;
  elements.habitComposer.reset();
  elements.habitComposer.elements.time.value = '08:00';
  elements.habitComposer.elements.emoji.value = '✨';
  elements.habitComposer.elements.color.value = '#ffd1a8';
}

function switchLanguage(language) {
  currentLanguage = normalizeLanguage(language);
  localStorage.setItem(languageStorageKey, currentLanguage);
  applyStaticTranslations();
  renderDate();
  renderPrompts();
  render();
}

document.addEventListener('click', (event) => {
  const openButton = event.target.closest('[data-open-composer]');
  if (openButton) openComposer();

  const closeButton = event.target.closest('[data-close-composer]');
  if (closeButton) closeComposer();

  if (event.target === elements.composerModal) closeComposer();

  const habitButton = event.target.closest('[data-habit-id]');
  if (habitButton) persist(toggleHabit(habits, habitButton.dataset.habitId));

  const promptButton = event.target.closest('[data-prompt]');
  if (promptButton) {
    journalHasDefaultCopy = false;
    elements.journal.value = `${elements.journal.value}\n\n${promptButton.dataset.prompt}`;
  }

  const packButton = event.target.closest('[data-pack-id]');
  if (packButton) {
    activePackId = packButton.dataset.packId;
    renderRoutines();
  }

  const addPackButton = event.target.closest('[data-add-pack]');
  if (addPackButton) {
    const pack = getLocalizedPacks().find((item) => item.id === addPackButton.dataset.addPack);
    const existingSources = new Set(
      habits
        .filter((habit) => habit.sourceRoutineId === pack.id)
        .map((habit) => `${habit.sourceRoutineId}:${habit.sourceRoutineIndex}`),
    );
    const packHabits = pack.habits
      .map((title, index) => ({ title, index }))
      .filter(({ index }) => !existingSources.has(`${pack.id}:${index}`))
      .map(({ title, index }) => ({
        ...createHabit({
          title,
          category: pack.tag,
          time: `${String(8 + index).padStart(2, '0')}:00`,
          emoji: pack.emoji,
          color: pack.color,
        }),
        sourceRoutineId: pack.id,
        sourceRoutineIndex: index,
      }));
    persist([...habits, ...packHabits]);
  }
});

elements.habitComposer.addEventListener('submit', (event) => {
  event.preventDefault();
  const formValues = Object.fromEntries(new FormData(elements.habitComposer));
  const habit = createHabit({
    ...formValues,
    category: formValues.category || t('defaultCategory'),
  });
  persist([...habits, habit]);
  closeComposer();
});

elements.journal.addEventListener('input', () => {
  journalHasDefaultCopy = false;
});

elements.languageSelect.addEventListener('change', (event) => {
  switchLanguage(event.target.value);
});

switchLanguage(currentLanguage);
