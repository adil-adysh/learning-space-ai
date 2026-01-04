import { LearningCard } from './types';

function qs<T extends HTMLElement>(sel: string) { return document.querySelector(sel) as T | null; }

function srAnnounce(message: string) {
  const el = qs<HTMLDivElement>('#sr-announcements');
  if (el) el.textContent = message;
}

function renderCards(cards: LearningCard[]) {
  const list = qs<HTMLUListElement>('#cards');
  if (!list) return;
  list.innerHTML = '';
  for (const c of cards) {
    const li = document.createElement('li');
    li.className = 'card';
    li.setAttribute('data-id', c.id);

    const article = document.createElement('article');
    article.setAttribute('aria-labelledby', `title-${c.id}`);

    const title = document.createElement('h2');
    title.id = `title-${c.id}`;
    title.textContent = c.title;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${c.topic || 'General'} · ${c.createdAt.toLocaleString()}`;

    const status = document.createElement('p');
    status.className = 'status';
    status.textContent = c.status === 'done' ? 'Status: Done' : 'Status: To do';

    const promptPreview = document.createElement('pre');
    promptPreview.className = 'prompt';
    promptPreview.textContent = c.prompt;
    promptPreview.setAttribute('tabindex','0');

    const controls = document.createElement('div');
    controls.className = 'controls-row';

    const runBtn = document.createElement('button');
    runBtn.className = 'primary';
    runBtn.textContent = 'Run';
    runBtn.setAttribute('aria-label', `Run prompt for ${c.title}`);
    runBtn.addEventListener('click', async () => {
      await window.api.runPrompt(c.prompt);
    });

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'ghost';
    toggleBtn.textContent = c.status === 'done' ? 'Mark as not completed' : 'Mark as completed';
    toggleBtn.setAttribute('aria-pressed', c.status === 'done' ? 'true' : 'false');
    toggleBtn.addEventListener('click', async () => {
      const newStatus = c.status === 'done' ? 'todo' : 'done';
      await window.api.toggleCard(c.id, newStatus as LearningCard['status']);
      srAnnounce(`${c.title} marked ${newStatus === 'done' ? 'completed' : 'not completed'}`);
      await loadAndRender();
    });

    controls.appendChild(runBtn);
    controls.appendChild(toggleBtn);

    article.appendChild(title);
    article.appendChild(meta);
    article.appendChild(status);
    article.appendChild(promptPreview);
    article.appendChild(controls);

    li.appendChild(article);
    list.appendChild(li);
  }
}

async function loadAndRender(focusFirst = false) {
  const cards = await window.api.getCards();
  // sort by createdAt desc
  cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  renderCards(cards);
  if (focusFirst) {
    const firstRun = document.querySelector('#cards button.primary') as HTMLButtonElement | null;
    if (firstRun) firstRun.focus();
  }
}

async function setupForm() {
  const form = qs<HTMLFormElement>('#addForm');
  const title = qs<HTMLInputElement>('#title');
  const topic = qs<HTMLInputElement>('#topic');
  const prompt = qs<HTMLTextAreaElement>('#prompt');
  const clear = qs<HTMLButtonElement>('#clearForm');
  const formStatus = qs<HTMLDivElement>('#form-status');
  if (!form || !title || !prompt) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const t = title.value.trim();
    const p = prompt.value.trim();
    const top = topic?.value.trim() || '';
    if (!t || !p) {
      if (formStatus) formStatus.textContent = 'Please provide a title and prompt.';
      return;
    }
    await window.api.addCard({ title: t, prompt: p, topic: top });
    if (formStatus) formStatus.textContent = `Added “${t}”`;
    title.value = '';
    prompt.value = '';
    if (topic) topic.value = '';
    await loadAndRender(true);
  });

  clear?.addEventListener('click', (ev) => {
    ev.preventDefault();
    title.value = '';
    prompt.value = '';
    if (topic) topic.value = '';
    if (formStatus) formStatus.textContent = 'Cleared form.';
    title.focus();
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await setupForm();
  await loadAndRender();
});

export {};
