/**
 * AI Prompt for generating LearningCards
 * 
 * This prompt is used to generate a URL that opens ChatGPT
 * with pre-filled instructions for creating LearningCard JSON data.
 */
export const AI_LEARNING_CARD_PROMPT = `You are a learning assistant helping to generate structured learning cards.

Please generate a JSON file with the following structure:

{
  "version": 1,
  "cards": [
    {
      "id": "unique-uuid",
      "title": "Card title",
      "prompt": "Detailed learning prompt (max 8000 chars)",
      "topic": "Optional topic",
      "project": "project-id-will-be-set-automatically",
      "status": "active",
      "createdAt": "ISO 8601 date string"
    }
  ]
}

Requirements:
- Return ONLY valid JSON (no markdown, no explanations)
- Each card must have: id, title, prompt, status, createdAt
- id must be a unique UUID v4
- status must be either "active" or "done"
- createdAt must be a valid ISO 8601 date string
- prompt field can be up to 8000 characters
- topic is optional
- project will be automatically set on import (ignore this field)

Generate 3-5 learning cards on a topic of your choice, or ask me what topic I'd like to learn about.`;

/**
 * Generate a ChatGPT URL with the AI prompt pre-filled
 */



