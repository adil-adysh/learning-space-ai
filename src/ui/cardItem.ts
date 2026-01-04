import { LearningCard } from '../types';

export function createCardItem(card: LearningCard, handlers: { onStart: (c: LearningCard) => Promise<void>, onToggle: (c: LearningCard) => Promise<void> }) {
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('data-id', card.id);

  // Header: Title and metadata
  const header = document.createElement('header');
  
  const title = document.createElement('h3');
  title.textContent = card.title;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${card.topic ? card.topic : 'General'} · ${card.createdAt.toLocaleString()}`;

  header.appendChild(title);
  header.appendChild(meta);

  // Section: Status and prompt
  const contentSection = document.createElement('section');
  
  const status = document.createElement('p');
  status.className = 'status';
  status.setAttribute('role', 'status');
  status.textContent = card.status === 'done' ? '✓ Completed' : '○ Not completed';

  const promptPreview = document.createElement('pre');
  promptPreview.className = 'prompt';
  promptPreview.textContent = card.prompt;
  promptPreview.tabIndex = 0;
  
  contentSection.appendChild(status);
  contentSection.appendChild(promptPreview);

  // Footer: Actions
  const footer = document.createElement('footer');
  footer.className = 'actions';

  const startBtn = document.createElement('button');
  startBtn.type = 'button';
  startBtn.className = 'primary';
  startBtn.id = `start-${card.id}`;
  startBtn.textContent = 'Start learning';
  startBtn.addEventListener('click', async () => { 
    await handlers.onStart(card); 
    import('./logger').then(m=>m.log('CardItem','start',{id:card.id,title:card.title})).catch(()=>{}); 
  });

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'ghost';
  toggleBtn.id = `toggle-${card.id}`;
  const toggleText = card.status === 'done' ? 'Revisit' : 'Mark as completed';
  toggleBtn.textContent = toggleText;
  toggleBtn.addEventListener('click', async () => { 
    await handlers.onToggle(card); 
    import('./logger').then(m=>m.log('CardItem','toggle',{id:card.id,title:card.title})).catch(()=>{}); 
  });

  footer.appendChild(startBtn);
  footer.appendChild(toggleBtn);

  article.appendChild(header);
  article.appendChild(contentSection);
  article.appendChild(footer);

  return article;
}
