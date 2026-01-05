import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

// Render the ModalContainer with NoteModal via the existing test wrapper
const NoteWrapperImport = () => import('./__tests__/NoteModalTestWrapper.svelte');

const sampleNote = (id = 'n1', content = 'Note content here') => ({
  id,
  cardId: 'c1',
  title: 'Existing Note',
  content,
  tags: [],
  createdAt: new Date().toISOString(),
});

test('creating a note focuses the newly-created note element', async () => {
  let created: any = null;
  (globalThis as any).api = {
    getNotes: vi.fn().mockResolvedValue([sampleNote('n1')]),
    createNote: vi.fn().mockImplementation((payload: any) => {
      created = { ...payload, id: 'n2', createdAt: new Date().toISOString() };
      return created;
    }),
    updateNote: vi.fn().mockResolvedValue(null),
    deleteNote: vi.fn().mockResolvedValue(null),
  };

  const NoteWrapper = (await NoteWrapperImport()).default;
  render(NoteWrapper, { props: { cardId: 'c1', cardTitle: 'Card 1', confirmFn: () => true } });

  // Open New Note editor
  const newBtn = page.getByRole('button', { name: /New Note/i });
  await newBtn.click();

  const titleInput = page.getByRole('textbox', { name: /Title/i });
  await titleInput.fill('Created Title');
  const contentInput = page.getByRole('textbox', { name: /Content/i });
  await contentInput.fill('Created content');

  const saveBtn = page.getByRole('button', { name: /Save/i });
  await saveBtn.click();

  // Wait for the newly-created note element to be visible and focused
  const createdBtn = page.getByRole('button', { name: /Open note Created Title/i });
  await expect.element(createdBtn).toBeVisible();
  await expect.element(createdBtn).toBeFocused();
});

test('opening a note shows sanitized HTML in NoteView', async () => {
  const dangerous = "# Heading\n<script>alert('x')</script>**bold**";
  (globalThis as any).api = {
    getNotes: vi.fn().mockResolvedValue([sampleNote('n1', dangerous)]),
    createNote: vi.fn().mockResolvedValue(null),
    updateNote: vi.fn().mockResolvedValue(null),
    deleteNote: vi.fn().mockResolvedValue(null),
  };

  const NoteWrapper = (await NoteWrapperImport()).default;
  render(NoteWrapper, { props: { cardId: 'c1', cardTitle: 'Card 1', confirmFn: () => true } });

  // Click the note to open NoteView
  const openBtn = page.getByRole('button', { name: /Open note Existing Note/i });
  await openBtn.click();

  // Wait for the NoteView heading and bold text to be visible (sanitized markdown rendered)
  await expect.element(page.getByRole('heading', { name: /Heading/i })).toBeVisible();
  await expect.element(page.getByText('bold')).toBeVisible();
});
