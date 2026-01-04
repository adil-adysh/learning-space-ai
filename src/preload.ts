import { contextBridge, ipcRenderer } from 'electron';
import { LearningCard, RawCard, Status } from './types';

async function toLearningCard(raw: RawCard): Promise<LearningCard> {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt)
  };
}

contextBridge.exposeInMainWorld('api', {
  getCards: async (): Promise<LearningCard[]> => {
    const raws = (await ipcRenderer.invoke('cards:get')) as RawCard[];
    return Promise.all(raws.map(toLearningCard));
  },
  addCard: async (data: { title: string; prompt: string; topic?: string }): Promise<LearningCard> => {
    const raw = (await ipcRenderer.invoke('cards:add', data)) as RawCard;
    return toLearningCard(raw);
  },
  toggleCard: async (id: string, status: Status): Promise<LearningCard> => {
    const raw = (await ipcRenderer.invoke('cards:toggle', { id, status })) as RawCard;
    return toLearningCard(raw);
  },
  runPrompt: async (prompt: string): Promise<void> => {
    await ipcRenderer.invoke('cards:run', prompt);
  }
});

// Minimal typing for renderer
declare global {
  interface Window {
    api: {
      getCards(): Promise<LearningCard[]>;
      addCard(data: { title: string; prompt: string; topic?: string }): Promise<LearningCard>;
      toggleCard(id: string, status: Status): Promise<LearningCard>;
      runPrompt(prompt: string): Promise<void>;
    };
  }
}

export {};
