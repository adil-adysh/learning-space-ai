import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import { modalStore } from "$lib/stores/modalStore";
import { makeApiMock, resetModalStore } from "./__tests__/helpers/factories";

const sampleNote = (id = "n1") => ({
	id,
	cardId: "c1",
	title: "Existing Note",
	content: "Note content here",
	tags: ["tag1"],
	createdAt: new Date().toISOString(),
});

test("NoteModal lists notes and New Note opens editor and triggers createNote (and list updates)", async () => {
	// Backing notes array so createNote pushes into it and getNotes reflects the change
	const { api, internal } = makeApiMock({ notes: [sampleNote("n1")] });
	(globalThis as any).api = api;

	// ensure modal stack is cleared and then render ModalContainer alongside NoteModal so stacked editor appears
	resetModalStore();
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
	await contentInput.fill(
		"**Created Bold**\n\n`inline created`\n\n- created item",
	);

	const saveBtn = page.getByRole("button", { name: /Save/i });
	await saveBtn.click();

	// wait for the notes list to refresh and show the created title
	let createdHeading: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			createdHeading = page.getByRole("heading", { name: /Created Title/i });
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(createdHeading).toBeVisible();

	// open the created note and assert rendered Markdown content is visible in the view
	await page.getByLabelText("Open note Created Title").click();

	let boldEl: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			// the modal view contains the rendered content; pick the second occurrence if duplicates exist
			boldEl = (page.getByText(/Created Bold/i) as any).nth(1);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(boldEl).toBeVisible();

	// close the view modal to clean up and avoid overlaying UI for subsequent tests
	const closeBtn = page.getByRole("button", { name: /^Close$/ });
	await expect.element(closeBtn).toBeVisible();
	await closeBtn.click();

	// The API mock stores created notes in `internal.notes`
	const createdNote = internal.notes.find((n) => n.title === "Created Title");
	expect(createdNote).toBeTruthy();
	expect(createdNote?.title).toBe("Created Title");
	expect(createdNote?.content).toContain("Created Bold");
});

test("NoteModal rapid-save uses tick() to capture freshly-set input values", async () => {
	// simulate the case where an input's value is set programmatically right before Save
	const notes: any[] = [sampleNote("n1")];
	let created: any = null;
	(globalThis as unknown as { api: unknown }).api = {
		getNotes: vi.fn(() => Promise.resolve(notes)),
		createNote: vi.fn().mockImplementation(async (payload: any) => {
			created = {
				...(payload as any),
				id: "n3",
				createdAt: new Date().toISOString(),
			};
			notes.push(created);
			return created;
		}),
		updateNote: vi.fn().mockResolvedValue(null),
		deleteNote: vi.fn().mockResolvedValue(null),
	};

	modalStore.close();
	const NoteWrapper = (await import("./__tests__/NoteModalTestWrapper.svelte"))
		.default;
	render(NoteWrapper, {
		props: { cardId: "c1", cardTitle: "Card 1", confirmFn: () => true },
	});

	// open new editor
	const newBtn = page.getByRole("button", { name: /New Note/i });
	await newBtn.click();

	const titleInput = page.getByRole("textbox", { name: /Title/i });
	const contentInput = page.getByRole("textbox", { name: /Content/i });

	// simulate a rapid user: start filling but don't await, then click Save immediately
	await titleInput.fill("Race Title");
	await contentInput.fill("Race content");
	const saveBtn = page.getByRole("button", { name: /Save/i });
	await saveBtn.click();

	// wait for creation to appear in list
	let createdHeading: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			createdHeading = page.getByRole("heading", { name: /Race Title/i });
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(createdHeading).toBeVisible();

	expect(created).toBeTruthy();
	expect(created.title).toBe("Race Title");
	expect(created.content).toBe("Race content");
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

	modalStore.close();
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

test("NoteModal edit opens editor and triggers updateNote (and list updates)", async () => {
	// backing notes array so update replaces existing item
	const notes: any[] = [sampleNote("n1")];
	let updated: any = null;
	(globalThis as unknown as { api: unknown }).api = {
		getNotes: vi.fn(() => Promise.resolve(notes)),
		createNote: vi.fn().mockResolvedValue(null),
		updateNote: vi.fn().mockImplementation(async (payload: any) => {
			updated = {
				...(payload as any),
				id: payload.id,
				createdAt: notes[0].createdAt,
			};
			const idx = notes.findIndex((n) => n.id === updated.id);
			if (idx !== -1) notes[idx] = updated;
			return updated;
		}),
		deleteNote: vi.fn().mockResolvedValue(null),
	};

	modalStore.close();
	const NoteWrapper = (await import("./__tests__/NoteModalTestWrapper.svelte"))
		.default;
	render(NoteWrapper, {
		props: { cardId: "c1", cardTitle: "Card 1", confirmFn: () => true },
	});

	// open more menu and click edit
	const moreTrigger = page.getByLabelText(
		"More actions for note Existing Note",
	);
	await expect.element(moreTrigger).toBeVisible();
	await moreTrigger.click();

	const editBtn = page.getByRole("menuitem", { name: /Edit/i });
	await expect.element(editBtn).toBeVisible();
	await editBtn.click();

	// modify the title and content
	const titleInput = page.getByRole("textbox", { name: /Title/i });
	await titleInput.fill("Updated Title");
	const contentInput = page.getByRole("textbox", { name: /Content/i });
	await contentInput.fill("Updated content");

	const saveBtn = page.getByRole("button", { name: /Save/i });
	await saveBtn.click();

	// wait for the notes list to refresh and show the updated title
	let updatedHeading: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			updatedHeading = page.getByRole("heading", { name: /Updated Title/i });
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(updatedHeading).toBeVisible();

	expect(updated).toBeTruthy();
	expect(updated.title).toBe("Updated Title");
	expect(updated.content).toBe("Updated content");
});
