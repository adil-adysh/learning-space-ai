import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import CardItem from './CardItem.svelte';

test('CardItem Start button clickable and triggers callback', async () => {
  const card = {
    id: 'c1',
    title: 'Test Card',
    prompt: 'Do something',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const onStart = vi.fn();
  const onToggle = vi.fn();

  render(CardItem, {
    props: {
      card,
      onStart,
      onToggle,
    },
  });

  const startBtn = page.getByRole('button', { name: /Start chat/i });
  await expect.element(startBtn).toBeVisible();
  await startBtn.click();

  expect(onStart).toHaveBeenCalledOnce();

  // Verify checkbox toggles status
  const toggleCheckbox = page.getByRole('checkbox', { name: /Mark Test Card as done/i });
  await expect.element(toggleCheckbox).toBeVisible();
  await toggleCheckbox.click();
  expect(onToggle).toHaveBeenCalledOnce();
  expect(onToggle).toHaveBeenCalledWith('c1', 'done');
});
