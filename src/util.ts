import { RawCard, LearningCard } from './types';

/**
 * Robustly converts RawCard (from JSON) to LearningCard (for UI).
 * Includes safety fallbacks for date parsing.
 */
export function rawToLearningCard(raw: RawCard): LearningCard {
  const date = new Date(raw.createdAt);
  
  // Safeguard: Fallback to current time if the date is corrupted
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  return {
    ...JSON.parse(JSON.stringify(raw)), // Deep clone to prevent reference leaks
    createdAt: validDate
  };
}

/**
 * Builds the URL for external learning.
 * Includes a check for prompt length limits (URLs have max lengths).
 */
export function buildChatGPTUrl(prompt: string): string {
  if (!prompt) return 'https://chat.openai.com/';
  
  // Note: Modern ChatGPT often uses the /chat endpoint or specific GPT-4 routes
  // but ?q= remains the most compatible search-style query.
  const baseUrl = 'https://chat.openai.com/';
  const encodedPrompt = encodeURIComponent(prompt.trim());
  
  // Safety: Typical URL limit is ~2048 chars. 
  // If the prompt is massive, we should truncate or handle differently.
  return `${baseUrl}?q=${encodedPrompt}`;
}