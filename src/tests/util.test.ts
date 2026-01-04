import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChatGPTUrl } from '../util';

test('buildChatGPTUrl encodes special chars', () => {
  const p = 'Hello & world?=/#\nNewLine';
  const url = buildChatGPTUrl(p);
  assert.strictEqual(url, 'https://chat.openai.com/?q=' + encodeURIComponent(p));
});
