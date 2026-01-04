import { contextBridge, ipcRenderer } from 'electron';
import type { LearningCard, RawCard, Status, Project, RawProject } from './types';

console.log('[preload] Preload script loaded');

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
    getProjects: async (): Promise<Project[]> => {
      const list = (await ipcRenderer.invoke('projects:list')) as RawProject[];
      return list.map(
        (p): Project => ({ ...p, createdAt: p.createdAt ? new Date(p.createdAt) : undefined })
      );
    },
    createProject: async (name: string): Promise<Project> => {
      const created = (await ipcRenderer.invoke('projects:create', name)) as RawProject;
      return { ...created, createdAt: created.createdAt ? new Date(created.createdAt) : undefined };
    },
    updateProject: async (id: string, name: string): Promise<Project> => {
      const updated = (await ipcRenderer.invoke('projects:update', { id, name })) as RawProject;
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
  console.log('[preload] API exposed successfully');
} catch (err) {
  console.error('[preload] Failed to expose API:', err);
}

// Minimal typing for renderer
declare global {
  interface Window {
    api: {
      getCards(): Promise<LearningCard[]>;
      addCard(data: { title: string; prompt: string; topic?: string }): Promise<LearningCard>;
      getProjects(): Promise<Project[]>;
      createProject(name: string): Promise<Project>;
      updateProject(id: string, name: string): Promise<Project>;
      deleteProject(id: string): Promise<RawProject>;
      toggleCard(id: string, status: Status): Promise<LearningCard>;
      runPrompt(prompt: string): Promise<void>;
    };
  }
}

export {};
