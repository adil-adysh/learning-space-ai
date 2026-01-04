import { promises as fs } from 'fs';
import * as path from 'path';
import { RawCard } from './types';

export async function readCardsFrom(filePath: string): Promise<RawCard[]> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    
    if (!Array.isArray(parsed)) {
      console.error('Storage: Data format is not an array.');
      return [];
    }
    
    return parsed as RawCard[];
  } catch (e: any) {
    // If file doesn't exist, that's fine (first run)
    if (e.code === 'ENOENT') return [];
    
    // IMPORTANT: If file exists but is unreadable/corrupt, 
    // we should NOT return an empty array and risk overwriting later.
    console.error(`Storage: Failed to read cards at ${filePath}`, e);
    throw new Error('DATABASE_CORRUPTION_DETECTED');
  }
}

/**
 * Writes cards using an Atomic pattern to prevent corruption
 */
export async function writeCardsTo(filePath: string, cards: RawCard[]) {
  const tempPath = `${filePath}.tmp`;
  const dir = path.dirname(filePath);

  try {
    await fs.mkdir(dir, { recursive: true });
    
    // 1. Write to a temporary file first
    const data = JSON.stringify(cards, null, 2);
    await fs.writeFile(tempPath, data, 'utf8');
    
    // 2. Rename the temp file to the real file (Atomic move in most OSs)
    await fs.rename(tempPath, filePath);
    
    // 3. Optional: Create a backup copy for safety
    await fs.copyFile(filePath, `${filePath}.bak`);
    
  } catch (err) {
    console.error('Storage: Critical write failure', err);
    // Cleanup temp file if it exists
    try { await fs.unlink(tempPath); } catch { /* ignore */ }
    throw err;
  }
}