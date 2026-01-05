// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { LearningCard, RawCard, Status, Project, RawProject, Note, RawNote } from './types';

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  interface Window {
    api: {
      getCards(): Promise<LearningCard[]>;
      addCard(data: { title: string; prompt: string; topic?: string }): Promise<LearningCard>;
      updateCard(payload: {
        id: string;
        title?: string;
        prompt?: string;
        topic?: string;
        project?: string;
      }): Promise<LearningCard>;
      deleteCard(id: string): Promise<RawCard>;
      getProjects(): Promise<Project[]>;
      createProject(payload: { name: string; systemPrompt?: string }): Promise<Project>;
      updateProject(payload: { id: string; name: string; systemPrompt?: string }): Promise<Project>;
      deleteProject(id: string): Promise<RawProject>;
      toggleCard(id: string, status: Status): Promise<LearningCard>;
      runPrompt(prompt: string): Promise<void>;
      getNotes(cardId?: string): Promise<Note[]>;
      createNote(payload: { cardId: string; title: string; content: string; tags?: string[] }): Promise<Note>;
      updateNote(payload: { id: string; title?: string; content?: string; tags?: string[] }): Promise<Note>;
      deleteNote(id: string): Promise<RawNote>;
    };
  }
}

export {};
