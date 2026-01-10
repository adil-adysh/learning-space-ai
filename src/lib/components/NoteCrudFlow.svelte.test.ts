import { test, expect } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";

test("Full note CRUD flow: create, view, edit, delete", async () => {
	const createdProject = {
		id: "p-crud",
		name: "CRUDProj",
		systemPrompt: "Sys",
	};
	const createdCard = {
		id: "c-crud-1",
		title: "CRUD Card",
		prompt: "Explain promises",
		status: "active",
		createdAt: new Date().toISOString(),
		project: "p-crud",
	};

	const notes: any[] = [];

	const api = {
		getProjects: () => Promise.resolve([]),
		createProject: (p: any) =>
			Promise.resolve({ ...createdProject, name: p.name }),
		getCards: () => Promise.resolve([]),
		addCard: (c: any) => Promise.resolve({ ...createdCard, ...c }),
		getNotes: () => Promise.resolve(notes),
		createNote: (n: any) => {
			const created = { id: `n-${Date.now()}`, ...n };
			notes.push(created);
			return Promise.resolve(created);
		},
		updateNote: (n: any) => {
			const idx = notes.findIndex((x) => x.id === n.id);
			if (idx !== -1) notes[idx] = { ...notes[idx], ...n };
			return Promise.resolve(n);
		},
		deleteNote: (id: string) => {
			const idx = notes.findIndex((x) => x.id === id);
			if (idx !== -1) notes.splice(idx, 1);
			return Promise.resolve();
		},
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
	await nameInput.fill("CRUDProj");
	const systemInput = page.getByPlaceholder(
		/You are an expert JavaScript developer/i,
	);
	await systemInput.fill("Sys");
	await page.getByRole("button", { name: /Create project/i }).click();

	// Add a learning card
	await page.getByRole("button", { name: /New Learning Item/i }).click();
	await page.getByRole("textbox", { name: /Title/i }).fill("CRUD Card");
	await page
		.getByRole("textbox", { name: /Learning prompt/i })
		.fill("Explain promises");
	await page.getByRole("button", { name: /Save card/i }).click();

	// Open notes and create a note
	await page.getByRole("button", { name: /Open Notes/i }).click();
	await page.getByRole("button", { name: /New Note/i }).click();
	await page.getByRole("textbox", { name: /Title/i }).fill("Note CRUD Title");
	await page
		.getByRole("textbox", { name: /Content|Content/ })
		.fill("Initial body.");
	await page.getByRole("button", { name: /Save/i }).click();

	// Wait for the note to be present
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

	const heading = page.getByRole("heading", { name: /Note CRUD Title/i });
	await expect.element(heading).toBeVisible();

	// Open view
	await page.getByLabelText("Open note Note CRUD Title").click();

	let viewHeading: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			viewHeading = page.getByRole("heading", { name: /Note CRUD Title/i });
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(viewHeading).toBeVisible();
	await expect.element(page.getByText(/Initial body./i)).toBeVisible();

	// Close and edit via More menu
	await page.getByRole("button", { name: /^Close$/ }).click();
	await page.getByLabelText("More actions for note Note CRUD Title").click();
	await page.getByRole("menuitem", { name: /Edit/i }).click();
	await page.getByRole("textbox", { name: /Content/i }).fill("Updated body.");
	await page.getByRole("button", { name: /Save/i }).click();

	// Wait for update to be called
	let updated = false;
	for (let i = 0; i < 20; i++) {
		if ((api as any).updateNote && (api as any).updateNote.length >= 0) {
			// we don't have a spy here; check data
			if (notes.find((n) => n.content === "Updated body.")) {
				updated = true;
				break;
			}
		}
		await new Promise((r) => setTimeout(r, 50));
	}
	if (!updated) throw new Error("Note update did not propagate");

	// Delete
	await page.getByLabelText("More actions for note Note CRUD Title").click();
	(globalThis as any).confirm = () => true;
	await page.getByRole("menuitem", { name: /Delete/i }).click();

	await new Promise((r) => setTimeout(r, 100));
	// Ensure note removed from our mock store
	if (notes.find((n) => n.title === "Note CRUD Title"))
		throw new Error("Note not deleted");
});
