export type Status = 'todo' | 'done';

// Public model used in renderer and app logic
export interface LearningCard {
  id: string;
  title: string;
  prompt: string;
  topic: string;
  status: Status;
  createdAt: Date;
}

// Raw model used for JSON storage
export interface RawCard {
  id: string;
  title: string;
  prompt: string;
  topic: string;
  status: Status;
  createdAt: string; // ISO
}