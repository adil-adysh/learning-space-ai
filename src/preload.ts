import { contextBridge, ipcRenderer } from 'electron';
import type { LearningCard, RawCard, Status, Project, RawProject } from './types';

console.info('[preload] Preload script loaded');

async function toLearningCard(raw: RawCard): Promise<LearningCard> {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
  };
}

try {
  contextBridge.exposeInMainWorld('api', {
    getCards: async (): Promise<LearningCard[]> => {
      const raws = (await ipcRenderer.invoke('cards:get')) as RawCard[];
      return Promise.all(raws.map(toLearningCard));
    },
    addCard: async (data: {
      title: string;
      prompt: string;
      topic?: string;
    }): Promise<LearningCard> => {
      const raw = (await ipcRenderer.invoke('cards:add', data)) as RawCard;
      return toLearningCard(raw);
    },
    updateCard: async (payload: {
      id: string;
      title?: string;
      prompt?: string;
      topic?: string;
      project?: string;
    }): Promise<LearningCard> => {
      const raw = (await ipcRenderer.invoke('cards:update', payload)) as RawCard;
      return toLearningCard(raw);
    },
    deleteCard: async (id: string): Promise<RawCard> => {
      return (await ipcRenderer.invoke('cards:delete', id)) as RawCard;
    },
    getProjects: async (): Promise<Project[]> => {
      const list = (await ipcRenderer.invoke('projects:list')) as RawProject[];
      return list.map(
        (p): Project => ({ ...p, createdAt: p.createdAt ? new Date(p.createdAt) : undefined })
      );
    },
    createProject: async (payload: { name: string; systemPrompt?: string }): Promise<Project> => {
      const created = (await ipcRenderer.invoke('projects:create', payload)) as RawProject;
      return { ...created, createdAt: created.createdAt ? new Date(created.createdAt) : undefined };
    },
    updateProject: async (payload: {
      id: string;
      name: string;
      systemPrompt?: string;
    }): Promise<Project> => {
      const updated = (await ipcRenderer.invoke('projects:update', payload)) as RawProject;
      return { ...updated, createdAt: updated.createdAt ? new Date(updated.createdAt) : undefined };
    },
    deleteProject: async (id: string): Promise<RawProject> => {
      const removed = (await ipcRenderer.invoke('projects:delete', id)) as RawProject;
      return removed;
    },
    toggleCard: async (id: string, status: Status): Promise<LearningCard> => {
      const raw = (await ipcRenderer.invoke('cards:toggle', { id, status })) as RawCard;
      return toLearningCard(raw);
    },
    runPrompt: async (prompt: string): Promise<void> => {
      await ipcRenderer.invoke('cards:run', prompt);
    },
  });
  console.info('[preload] API exposed successfully');
} catch (err) {
  console.error('[preload] Failed to expose API:', err);
}

export {};
