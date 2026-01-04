import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import * as path from 'path';
import type { RawCard, RawProject } from './types';

interface Database {
  cards: RawCard[];
  projects: RawProject[];
}

let db: Low<Database> | null = null;

/**
 * Initialize the lowdb database
 * @param dataPath - Path to the data directory
 */
export async function initDatabase(dataPath: string): Promise<Low<Database>> {
  if (db) {
    return db;
  }

  const file = path.join(dataPath, 'learning-cards-db.json');
  const adapter = new JSONFile<Database>(file);

  db = new Low<Database>(adapter, { cards: [], projects: [] });

  await db.read();

  // Initialize with empty arrays if the file is new
  db.data ||= { cards: [], projects: [] };

  await db.write();

  return db;
}

/**
 * Get the database instance
 */
function getDb(): Low<Database> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
}

// ============================================================
// CARDS CRUD OPERATIONS
// ============================================================

export async function readCards(): Promise<RawCard[]> {
  const database = getDb();
  await database.read();
  return database.data.cards || [];
}

export async function writeCards(cards: RawCard[]): Promise<void> {
  const database = getDb();
  await database.read();
  database.data.cards = cards;
  await database.write();
}

export async function addCard(card: RawCard): Promise<RawCard> {
  const database = getDb();
  await database.read();
  database.data.cards.unshift(card);
  await database.write();
  return card;
}

export async function updateCard(id: string, updates: Partial<RawCard>): Promise<RawCard | null> {
  const database = getDb();
  await database.read();

  const idx = database.data.cards.findIndex((c) => c.id === id);
  if (idx === -1) {
    return null;
  }

  database.data.cards[idx] = { ...database.data.cards[idx], ...updates };
  await database.write();

  return database.data.cards[idx];
}

export async function deleteCard(id: string): Promise<RawCard | null> {
  const database = getDb();
  await database.read();

  const idx = database.data.cards.findIndex((c) => c.id === id);
  if (idx === -1) {
    return null;
  }

  const [removed] = database.data.cards.splice(idx, 1);
  await database.write();

  return removed;
}

// ============================================================
// PROJECTS CRUD OPERATIONS
// ============================================================

export async function readProjects(): Promise<RawProject[]> {
  const database = getDb();
  await database.read();
  return database.data.projects || [];
}

export async function writeProjects(projects: RawProject[]): Promise<void> {
  const database = getDb();
  await database.read();
  database.data.projects = projects;
  await database.write();
}

export async function addProject(project: RawProject): Promise<RawProject> {
  const database = getDb();
  await database.read();
  database.data.projects.push(project);
  database.data.projects.sort((a, b) => a.name.localeCompare(b.name));
  await database.write();
  return project;
}

export async function updateProject(
  id: string,
  updates: Partial<RawProject>
): Promise<RawProject | null> {
  const database = getDb();
  await database.read();

  const idx = database.data.projects.findIndex((p) => p.id === id);
  if (idx === -1) {
    return null;
  }

  database.data.projects[idx] = { ...database.data.projects[idx], ...updates };
  database.data.projects.sort((a, b) => a.name.localeCompare(b.name));
  await database.write();

  return database.data.projects[idx];
}

export async function deleteProject(id: string): Promise<RawProject | null> {
  const database = getDb();
  await database.read();

  const idx = database.data.projects.findIndex((p) => p.id === id);
  if (idx === -1) {
    return null;
  }

  const [removed] = database.data.projects.splice(idx, 1);
  await database.write();

  return removed;
}

export async function findProjectById(id: string): Promise<RawProject | null> {
  const database = getDb();
  await database.read();
  return database.data.projects.find((p) => p.id === id) || null;
}

export async function findProjectByName(name: string): Promise<RawProject | null> {
  const database = getDb();
  await database.read();
  return database.data.projects.find((p) => p.name === name) || null;
}

// ============================================================
// UTILITY OPERATIONS
// ============================================================

/**
 * Remove project references from all cards when a project is deleted
 */
export async function clearProjectFromCards(projectId: string): Promise<void> {
  const database = getDb();
  await database.read();

  let changed = false;
  for (const card of database.data.cards) {
    if (card.project === projectId) {
      card.project = '';
      changed = true;
    }
  }

  if (changed) {
    await database.write();
  }
}
