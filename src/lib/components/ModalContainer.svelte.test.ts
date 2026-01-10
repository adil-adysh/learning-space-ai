import type { SvelteComponent } from "svelte";
import { get } from "svelte/store";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import { modalStore } from "../stores/modalStore";
import ModalContainer from "./ModalContainer.svelte";
import NoteModal from "./NoteModal.svelte";

declare global {
	var api: {
		getNotes: () => Promise<unknown[]>;
		createNote: (payload: unknown) => Promise<unknown | null>;
		updateNote: (payload: unknown) => Promise<unknown | null>;
		deleteNote: (id: string) => Promise<unknown | null>;
	};
}

test("ModalContainer clears modalStore when child dispatches close", async () => {
	// mock window.api used by NoteModal
	(globalThis as unknown as { api: unknown }).api = {
		getNotes: vi.fn().mockResolvedValue([]),
		createNote: vi.fn().mockResolvedValue(null),
		updateNote: vi.fn().mockResolvedValue(null),
		deleteNote: vi.fn().mockResolvedValue(null),
	};

	render(ModalContainer);

	// open the NoteModal through the store (cast component to unknown to satisfy typings in tests)
	const noteModalComponent = NoteModal as unknown as typeof SvelteComponent;
	modalStore.open(noteModalComponent, {
		cardId: "c1",
		cardTitle: "Card 1",
		confirmFn: () => true,
	});

	// ensure the modal is visible
	const heading = page.getByRole("heading", { name: /Notes for Card 1/i });
	await expect.element(heading).toBeVisible();

	// click the close button via its accessible name
	const closeBtn = page.getByRole("button", {
		name: /Close notes for Card 1/i,
	});
	await expect.element(closeBtn).toBeVisible();
	await closeBtn.click();

	// allow ModalContainer's close clearing timeout to run
	await new Promise((r) => setTimeout(r, 250));

	const state = get(modalStore as unknown) as unknown[];
	// modalStore is now a stack; after close the stack should be empty
	expect(Array.isArray(state)).toBe(true);
	expect(state.length).toBe(0);
});
