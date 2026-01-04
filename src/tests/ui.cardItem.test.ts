import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createCardItem } from '../ui/cardItem';
import { LearningCard } from '../types';

// setup DOM
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).HTMLElement = dom.window.HTMLElement;

test('cardItem triggers handlers', async () => {
  const card: LearningCard = { id: '1', title: 'T', prompt: 'P', topic: 'X', status: 'todo', createdAt: new Date() };
  let started = false;
  let toggled = false;
  const el = createCardItem(card, {
    onStart: async () => { started = true; },
    onToggle: async () => { toggled = true; }
  });

  const startBtn = el.querySelector('button.primary') as HTMLButtonElement;
  const toggleBtn = el.querySelector('button.ghost') as HTMLButtonElement;
  startBtn.click();
  toggleBtn.click();
  // allow any async handlers
  await new Promise(r => setTimeout(r, 0));
  assert.equal(started, true);
  assert.equal(toggled, true);
});
