import { test, expect, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";

const sampleNote = (id = "n1") => ({
	id,
	cardId: "c1",
	title: "Existing Note",
	content: "Note content here",
	tags: ["tag1"],
	createdAt: new Date().toISOString(),
});

test("NoteModal lists notes and New Note opens editor and triggers createNote", async () => {
	// Mock the global window.api that the component resolves when no `api` prop is provided
	let created: unknown = null;
	(globalThis as unknown as { api: unknown }).api = {
		getNotes: vi.fn().mockResolvedValue([sampleNote("n1")]),
		createNote: vi.fn().mockImplementation(async (payload: unknown) => {
			created = payload as Record<string, unknown>;
			return { ...(payload as Record<string, unknown>), id: "n2", createdAt: new Date().toISOString() };
		}),
		updateNote: vi.fn().mockResolvedValue(null),
		deleteNote: vi.fn().mockResolvedValue(null),
	};

	// render ModalContainer alongside NoteModal so stacked editor appears
	const NoteWrapper = (await import("./__tests__/NoteModalTestWrapper.svelte"))
		.default;
	render(NoteWrapper, {
		props: { cardId: "c1", cardTitle: "Card 1", confirmFn: () => true },
	});

	const noteHeading = page.getByRole("heading", { name: /Existing Note/i });
	await expect.element(noteHeading).toBeVisible();

	const newBtn = page.getByRole("button", { name: /New Note/i });
	await expect.element(newBtn).toBeVisible();
	await newBtn.click();

	const titleInput = page.getByRole("textbox", { name: /Title/i });
	await titleInput.fill("Created Title");
	const contentInput = page.getByRole("textbox", { name: /Content/i });
	await contentInput.fill("Created content");

	const saveBtn = page.getByRole("button", { name: /Save/i });
	await saveBtn.click();

	expect(created).toBeTruthy();
	expect(created.title).toBe("Created Title");
	expect(created.content).toBe("Created content");
});

test("NoteModal delete calls deleteNote", async () => {
	let deleted: string | null = null;
	(globalThis as unknown as { api: unknown }).api = {
		getNotes: vi.fn().mockResolvedValue([sampleNote("n1")]),
		createNote: vi.fn().mockResolvedValue(null),
		updateNote: vi.fn().mockResolvedValue(null),
		deleteNote: vi.fn().mockImplementation((id: string) => {
			deleted = id;
			return { id };
		}),
	};

	const NoteWrapper = (await import("./__tests__/NoteModalTestWrapper.svelte"))
		.default;
	render(NoteWrapper, {
		props: { cardId: "c1", cardTitle: "Card 1", confirmFn: () => true },
	});

	// open the more menu first (summary uses aria-label)
	const moreTrigger = page.getByLabelText(
		"More actions for note Existing Note",
	);
	await expect.element(moreTrigger).toBeVisible();
	await moreTrigger.click();

	const deleteBtn = page.getByRole("menuitem", { name: /Delete/i });
	await expect.element(deleteBtn).toBeVisible();
	await deleteBtn.click();

	expect(deleted).toBe("n1");
});
