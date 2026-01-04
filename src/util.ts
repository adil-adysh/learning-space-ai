import { RawCard } from './types';

export function buildChatGPTUrl(prompt: string): string {
  return `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
}

export function rawToLearningCard(raw: RawCard) {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt)
  };
}
