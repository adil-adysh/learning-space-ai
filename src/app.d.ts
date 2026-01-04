// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { LearningCard, RawCard, Status, Project, RawProject } from './types';

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
