import { promises as fs } from 'fs';
import * as path from 'path';
import { RawCard } from './types';

export async function readCardsFrom(p: string): Promise<RawCard[]> {
  try {
    const raw = await fs.readFile(p, 'utf8');
    const parsed = JSON.parse(raw) as RawCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export async function writeCardsTo(p: string, cards: RawCard[]) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(cards, null, 2), 'utf8');
}
