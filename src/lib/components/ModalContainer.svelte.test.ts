import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import ModalContainer from './ModalContainer.svelte';
import NoteModal from './NoteModal.svelte';
import { modalStore } from '../stores/modalStore';
import { get } from 'svelte/store';

test('ModalContainer clears modalStore when child dispatches close', async () => {
  // mock window.api used by NoteModal
  (globalThis as any).api = {
    getNotes: vi.fn().mockResolvedValue([]),
    createNote: vi.fn().mockResolvedValue(null),
    updateNote: vi.fn().mockResolvedValue(null),
    deleteNote: vi.fn().mockResolvedValue(null),
  };

  render(ModalContainer);

  // open the NoteModal through the store (cast component to any to satisfy typings in tests)
  modalStore.open(NoteModal as any, { cardId: 'c1', cardTitle: 'Card 1', confirmFn: () => true });

  // ensure the modal is visible
  const heading = page.getByRole('heading', { name: /Notes for Card 1/i });
  await expect.element(heading).toBeVisible();

  // click the close button via its accessible name
  const closeBtn = page.getByRole('button', { name: /Close notes for Card 1/i });
  await expect.element(closeBtn).toBeVisible();
  await closeBtn.click();

  // allow ModalContainer's close clearing timeout to run
  await new Promise((r) => setTimeout(r, 250));

  const state: any = get(modalStore as any);
  // modalStore is now a stack; after close the stack should be empty
  expect(Array.isArray(state)).toBe(true);
  expect((state as any[]).length).toBe(0);
});
