export type Status = 'active' | 'done';

// Public model used in renderer and app logic
export interface LearningCard {
  id: string;
  title: string;
  prompt: string;
  topic?: string;
  project?: string; // optional project id the card belongs to
  status: Status;
  createdAt: Date;
}

// Raw model used for JSON storage
export interface RawCard {
  id: string;
  title: string;
  prompt: string;
  topic?: string;
  project?: string; // project id
  status: Status;
  createdAt: string; // ISO
}

// Project model
export interface Project {
  id: string;
  name: string;
  systemPrompt?: string; // Optional system prompt that prepends to all cards in this project
  createdAt?: Date;
}

export interface RawProject {
  id: string;
  name: string;
  systemPrompt?: string;
  createdAt?: string;
}
