import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readCardsFrom, writeCardsTo } from '../storage';
import { RawCard } from '../types';
import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';

test('write and read cards', async () => {
  const tmp = path.join(os.tmpdir(), 'cards-test-' + Date.now() + '.json');
  const cards: RawCard[] = [{
    id: '1',
    title: 'T',
    prompt: 'P',
    topic: 'X',
    status: 'todo',
    createdAt: new Date().toISOString()
  }];
  await writeCardsTo(tmp, cards);
  const read = await readCardsFrom(tmp);
  assert.deepStrictEqual(read, cards);
  await fs.unlink(tmp);
});
