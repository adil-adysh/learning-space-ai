import { test, expect } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import NoteContent from "./NoteContent.svelte";

test("NoteContent renders markdown into HTML (bold, inline code, list)", async () => {
	const markdown = "**Bold Text**\n\n`inline code`\n\n- list item";
	render(NoteContent, { props: { markdown } });

	// Poll for rendered elements
	let bold: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			bold = page.getByText(/Bold Text/i);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(bold).toBeVisible();

	let code: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			code = page.getByText(/inline code/i);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(code).toBeVisible();

	let list: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			list = page.getByText(/list item/i);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(list).toBeVisible();
});
