import { describe, it, expect } from "vitest";
import { AI_LEARNING_CARD_PROMPT } from "./aiPrompts";
import { buildChatGPTUrl } from "../../util";

describe("AI Prompts", () => {
	describe("AI_LEARNING_CARD_PROMPT", () => {
		it("should contain required instructions", () => {
			expect(AI_LEARNING_CARD_PROMPT).toContain("version");
			expect(AI_LEARNING_CARD_PROMPT).toContain("cards");
			expect(AI_LEARNING_CARD_PROMPT).toContain("JSON");
		});

		it("should specify required fields", () => {
			expect(AI_LEARNING_CARD_PROMPT).toContain("id");
			expect(AI_LEARNING_CARD_PROMPT).toContain("title");
			expect(AI_LEARNING_CARD_PROMPT).toContain("prompt");
			expect(AI_LEARNING_CARD_PROMPT).toContain("status");
			expect(AI_LEARNING_CARD_PROMPT).toContain("createdAt");
		});

		it("should specify valid status values", () => {
			expect(AI_LEARNING_CARD_PROMPT).toContain("active");
			expect(AI_LEARNING_CARD_PROMPT).toContain("done");
		});

		it("should mention ISO 8601 date format", () => {
			expect(AI_LEARNING_CARD_PROMPT).toContain("ISO");
		});
	});

	describe("buildChatGPTUrl integration with AI_LEARNING_CARD_PROMPT", () => {
		it("should generate valid ChatGPT URL with prompt", () => {
			const url = buildChatGPTUrl(AI_LEARNING_CARD_PROMPT);

			expect(url).toContain("https://chat.openai.com/");
			expect(url).toContain("?q=");
		});

		it("should include project context when provided", () => {
			const projectName = "My Test Project";
			const prompt = `${AI_LEARNING_CARD_PROMPT}\n\nGenerate cards related to the project: "${projectName}"`;
			const url = buildChatGPTUrl(prompt);

			expect(url).toContain(encodeURIComponent(projectName));
		});

		it("should encode prompt properly", () => {
			const url = buildChatGPTUrl(AI_LEARNING_CARD_PROMPT);

			// URL should be properly encoded
			expect(url).not.toContain(" ");
			expect(url).not.toContain("\n");
		});
	});

	

	
});
