import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import CardItemTestWrapper from './__tests__/CardItemTestWrapper.svelte';

test('More menu Edit/Delete dispatch actions', async () => {
  const card = {
    id: 'c1',
    title: 'Test Card',
    prompt: 'Do something',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const onStart = vi.fn();
  const onToggle = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  render(CardItemTestWrapper, {
    props: {
      card,
      onStart,
      onToggle,
      onEdit,
      onDelete,
    },
  });

  const moreBtn = page.getByRole('button', { name: /More actions for Test Card/i });
  await expect.element(moreBtn).toBeVisible();
  await moreBtn.click();

  const editItem = page.getByRole('menuitem', { name: /Edit/i });
  await expect.element(editItem).toBeVisible();
  await editItem.click();
  expect(onEdit).toHaveBeenCalledOnce();

  // Re-open and click Delete
  await moreBtn.click();
  const deleteItem = page.getByRole('menuitem', { name: /Delete/i });
  await expect.element(deleteItem).toBeVisible();
  await deleteItem.click();
  expect(onDelete).toHaveBeenCalledOnce();
});
