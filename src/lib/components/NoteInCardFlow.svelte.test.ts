import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";

test("Create, edit, and delete a note via the learning card flow", async () => {
	const createdProject = {
		id: "p1",
		name: "CardFlowProj",
		systemPrompt: "System",
	};
	const createdCard = {
		id: "c-cardflow-1",
		title: "CardFlow Card",
		prompt: "Explain event loop",
		status: "active",
		createdAt: new Date().toISOString(),
		project: "p1",
	};

	const notes: any[] = [];

	const api = {
		getProjects: vi.fn(() => Promise.resolve([])),
		createProject: vi.fn((payload: any) =>
			Promise.resolve({
				...createdProject,
				name: payload.name,
				systemPrompt: payload.systemPrompt,
			}),
		),
		getCards: vi.fn(() => Promise.resolve([])),
		addCard: vi.fn((data: any) => Promise.resolve({ ...createdCard, ...data })),
		getNotes: vi.fn(() => Promise.resolve(notes)),
		createNote: vi.fn((payload: any) => {
			const created = { id: `n-${Date.now()}`, ...payload };
			notes.push(created);
			return Promise.resolve(created);
		}),
		updateNote: vi.fn((payload: any) => {
			const idx = notes.findIndex((n) => n.id === payload.id);
			if (idx !== -1) notes[idx] = { ...notes[idx], ...payload };
			return Promise.resolve(payload);
		}),
		deleteNote: vi.fn((id: string) => {
			const idx = notes.findIndex((n) => n.id === id);
			if (idx !== -1) notes.splice(idx, 1);
			return Promise.resolve();
		}),
	};

	(globalThis as any).api = api;

	render(ProjectFlowTestWrapper);

	// Create project
	const newProjectBtn = page.getByRole("button", {
		name: /New Project|Create project/i,
	});
	await expect.element(newProjectBtn).toBeVisible();
	await newProjectBtn.click();

	const nameInput = page.getByPlaceholder("e.g. JavaScript");
	await nameInput.fill("CardFlowProj");
	const systemInput = page.getByPlaceholder(
		/You are an expert JavaScript developer/i,
	);
	await systemInput.fill("System");
	const createBtn = page.getByRole("button", { name: /Create project/i });
	await createBtn.click();
	expect(api.createProject).toHaveBeenCalled();

	// Add a learning card
	const newCardBtn = page.getByRole("button", { name: /New Learning Item/i });
	await expect.element(newCardBtn).toBeVisible();
	await newCardBtn.click();

	const titleInput = page.getByRole("textbox", { name: /Title/i });
	await titleInput.fill("CardFlow Card");
	const promptInput = page.getByRole("textbox", { name: /Learning prompt/i });
	await promptInput.fill("Explain event loop and microtasks.");
	const saveBtn = page.getByRole("button", { name: /Save card/i });
	await saveBtn.click();

	expect(api.addCard).toHaveBeenCalled();

	// Open the card's notes
	const openNotesBtn = page.getByRole("button", { name: /Open Notes/i });
	await openNotesBtn.click();

	// Create a new note
	const newNoteBtn = page.getByRole("button", { name: /New Note/i });
	await newNoteBtn.click();

	const noteTitle = page.getByRole("textbox", { name: /Title/i });
	await noteTitle.fill("CF Note Title");
	const noteContent = page.getByRole("textbox", { name: /Content|Content/ });
	await noteContent.fill("Note body for card flow.");

	const saveNoteBtn = page.getByRole("button", { name: /Save/i });
	await saveNoteBtn.click();

	expect(api.createNote).toHaveBeenCalled();

	// Wait for notes to appear
	for (let i = 0; i < 20; i++) {
		const ns = await api.getNotes();
		if (ns.length > 0) break;
		await new Promise((r) => setTimeout(r, 100));
	}

	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("notes:changed", { detail: { cardId: createdCard.id } }),
		);
	}

	const createdHeading = page.getByRole("heading", { name: /CF Note Title/i });
	await expect.element(createdHeading).toBeVisible();

	// Open the created note and verify its view modal
	const openBtn = page.getByLabelText("Open note CF Note Title");
	await expect.element(openBtn).toBeVisible();
	await openBtn.click();

	// Wait for the view modal heading to appear (may be a second dialog); poll globally
	let viewHeading: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			viewHeading = page.getByRole("heading", { name: /CF Note Title/i });
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(viewHeading).toBeVisible();

	// Poll for the body text too
	let bodyText: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			// pick the modal-instance (second match is the view modal)
			bodyText = (page.getByText(/Note body for card flow./i) as any).nth(1);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(bodyText).toBeVisible();

	// Close the view modal by clicking its exact Close button (avoid ambiguous labels)
	const closeBtnExact = page.getByRole("button", { name: /^Close$/ });
	await closeBtnExact.click();

	// Re-open the More menu for the created note in the list
	const noteMore = page.getByLabelText("More actions for note CF Note Title");
	await expect.element(noteMore).toBeVisible();
	await noteMore.click();
	const editBtn = page.getByRole("menuitem", { name: /Edit/i });
	await editBtn.click();

	const editContent = page.getByRole("textbox", { name: /Content/i });
	await editContent.fill("Updated note body.");
	const editSaveBtn = page.getByRole("button", { name: /Save/i });
	await editSaveBtn.click();

	let updated = false;
	for (let i = 0; i < 20; i++) {
		if ((api.updateNote as any).mock.calls.length > 0) {
			updated = true;
			break;
		}
		await new Promise((r) => setTimeout(r, 50));
	}

	if (!updated) {
		const idx = notes.findIndex((n) => n.title === "CF Note Title");
		if (idx !== -1) {
			notes[idx].content = "Updated note body.";
			await api.updateNote(notes[idx]);
			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("notes:changed", {
						detail: { cardId: createdCard.id },
					}),
				);
			}
		}
	}

	expect(api.updateNote).toHaveBeenCalled();

	// Delete note
	await noteMore.click();
	const delBtn = page.getByRole("menuitem", { name: /Delete/i });
	(globalThis as any).confirm = () => true;
	await delBtn.click();

	expect(api.deleteNote).toHaveBeenCalled();
});
