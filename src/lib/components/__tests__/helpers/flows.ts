import type { Page } from "playwright";
import { page as vitestPage } from "vitest/browser";

export async function createProject(name: string, systemPrompt = "System") {
	const page: Page = vitestPage as unknown as Page;
	await page.getByRole("button", { name: /New Project|Create project/i }).click();
	await page.getByPlaceholder("e.g. JavaScript").fill(name);
	await page.getByPlaceholder(/You are an expert JavaScript developer/i).fill(systemPrompt);
	await page.getByRole("button", { name: /Create project/i }).click();
	// wait for heading
	await page.getByRole("heading", { name: new RegExp(name, "i") });
}

export async function addCard(title: string, prompt: string) {
	const page: Page = vitestPage as unknown as Page;
	await page.getByRole("button", { name: /New Learning Item/i }).click();
	await page.getByRole("textbox", { name: /Title/i }).fill(title);
	await page.getByRole("textbox", { name: /Learning prompt/i }).fill(prompt);
	await page.getByRole("button", { name: /Save card/i }).click();
}

export async function openNotes() {
	const page: Page = vitestPage as unknown as Page;
	await page.getByRole("button", { name: /Open Notes/i }).click();
	await page.getByRole("heading", { name: /Notes for/i });
}
