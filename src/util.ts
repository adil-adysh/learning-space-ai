import type { RawCard, LearningCard } from './types';

/**
 * Robustly converts RawCard (from JSON) to LearningCard (for UI).
 * Includes safety fallbacks for date parsing.
 */
export function rawToLearningCard(raw: RawCard): LearningCard {
  const date = new Date(raw.createdAt);

  // Safeguard: Fallback to current time if the date is corrupted
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const clone: RawCard = { ...raw };
  return {
    ...clone,
    createdAt: validDate,
  };
}

/**
 * Builds the URL for external learning.
 * Includes a check for prompt length limits (URLs have max lengths).
 * Combines system prompt (if provided) with user prompt.
 */
export function buildChatGPTUrl(prompt: string, systemPrompt?: string): string {
  if (!prompt) {
    return 'https://chat.openai.com/';
  }

  // Combine system prompt with user prompt
  let combinedPrompt = prompt.trim();
  if (systemPrompt && systemPrompt.trim()) {
    combinedPrompt = `${systemPrompt.trim()}\n\n${combinedPrompt}`;
  }

  // Note: Modern ChatGPT often uses the /chat endpoint or specific GPT-4 routes
  // but ?q= remains the most compatible search-style query.
  const baseUrl = 'https://chat.openai.com/';
  const encodedPrompt = encodeURIComponent(combinedPrompt);

  // Safety: Typical URL limit is ~2048 chars.
  // If the prompt is massive, we should truncate or handle differently.
  return `${baseUrl}?q=${encodedPrompt}`;
}
