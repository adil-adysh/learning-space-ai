import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import NoteView from "./NoteView.svelte";

const sampleNote = () => ({
	id: "md1",
	title: "Markdown Note",
	content: "**Bold Text**\n\n`inline code`\n\n- list item",
	tags: ["t"],
	createdAt: new Date().toISOString(),
});

test("NoteView renders markdown content (bold, inline code, list)", async () => {
	const note = sampleNote();
	render(NoteView, { props: { note, cardId: "c1", api: null } });

	const heading = page.getByRole("heading", { name: /Markdown Note/i });
	await expect.element(heading).toBeVisible();

	// Check for bold text and inline code and list text
	const bold = page.getByText(/Bold Text/i);
	await expect.element(bold).toBeVisible();

	const code = page.getByText(/inline code/i);
	await expect.element(code).toBeVisible();

	const list = page.getByText(/list item/i);
	await expect.element(list).toBeVisible();
});
