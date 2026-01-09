import { describe, it, expect } from "vitest";
import { buildChatGPTUrl } from "../../util";

describe("buildChatGPTUrl", () => {
	it("returns base URL when prompt is empty", () => {
		expect(buildChatGPTUrl("")).toBe("https://chat.openai.com/");
	});

	it("encodes special characters", () => {
		const p = "Hello & world?=/#\nNewLine";
		const url = buildChatGPTUrl(p);
		expect(url).toBe("https://chat.openai.com/?q=" + encodeURIComponent(p));
	});

	it("combines system prompt with user prompt", () => {
		const userPrompt = "Explain closures";
		const systemPrompt = "You are a JavaScript expert.";
		const url = buildChatGPTUrl(userPrompt, systemPrompt);
		const expected = `${systemPrompt}\n\n${userPrompt}`;
		expect(url).toBe(
			"https://chat.openai.com/?q=" + encodeURIComponent(expected),
		);
	});
});
