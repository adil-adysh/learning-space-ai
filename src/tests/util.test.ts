import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChatGPTUrl } from '../util';

test('buildChatGPTUrl encodes special chars', () => {
  const p = 'Hello & world?=/#\nNewLine';
  const url = buildChatGPTUrl(p);
  assert.strictEqual(url, 'https://chat.openai.com/?q=' + encodeURIComponent(p));
});

test('buildChatGPTUrl combines system prompt with user prompt', () => {
  const userPrompt = 'Explain closures';
  const systemPrompt = 'You are a JavaScript expert.';
  const url = buildChatGPTUrl(userPrompt, systemPrompt);
  const expected = `${systemPrompt}\n\n${userPrompt}`;
  assert.strictEqual(url, 'https://chat.openai.com/?q=' + encodeURIComponent(expected));
});

test('buildChatGPTUrl works without system prompt', () => {
  const userPrompt = 'Explain promises';
  const url = buildChatGPTUrl(userPrompt);
  assert.strictEqual(url, 'https://chat.openai.com/?q=' + encodeURIComponent(userPrompt));
});
