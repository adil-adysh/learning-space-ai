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

  const startBtn = page.getByRole('button', { name: /Start in ChatGPT/i });
  await expect.element(startBtn).toBeVisible();
  await startBtn.click();

  expect(onStart).toHaveBeenCalledOnce();
});
