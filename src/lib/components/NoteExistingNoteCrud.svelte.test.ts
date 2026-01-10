import { test, expect } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";

test("Edit and delete an existing note via UI", async () => {
	const createdProject = {
		id: "p-ex",
		name: "ExistingProj",
		systemPrompt: "Sys",
	};
	const createdCard = {
		id: "c-ex-1",
		title: "Existing Card",
		prompt: "Explain async",
		status: "active",
		createdAt: new Date().toISOString(),
		project: "p-ex",
	};

	const notes = [
		{
			id: "n-ex-1",
			title: "Existing Note",
			content: "Original content.",
			tags: [],
			createdAt: new Date().toISOString(),
		},
	];

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

	// Create project then add card (same UI flow as other tests)
	await page
		.getByRole("button", { name: /New Project|Create project/i })
		.click();
	await page.getByPlaceholder("e.g. JavaScript").fill("ExistingProj");
	await page
		.getByPlaceholder(/You are an expert JavaScript developer/i)
		.fill("Sys");
	await page.getByRole("button", { name: /Create project/i }).click();

	await page.getByRole("button", { name: /New Learning Item/i }).click();
	await page.getByRole("textbox", { name: /Title/i }).fill("Existing Card");
	await page
		.getByRole("textbox", { name: /Learning prompt/i })
		.fill("Explain async");
	await page.getByRole("button", { name: /Save card/i }).click();

	// Open notes list (should show our pre-populated note)
	await page.getByRole("button", { name: /Open Notes/i }).click();

	const itemHeading = page.getByRole("heading", { name: /Existing Note/i });
	await expect.element(itemHeading).toBeVisible();

	// Edit via More menu
	await page.getByLabelText("More actions for note Existing Note").click();
	await page.getByRole("menuitem", { name: /Edit/i }).click();

	const contentBox = page.getByRole("textbox", { name: /Content/i });
	await expect.element(contentBox).toBeVisible();
	await contentBox.fill("Edited content via UI.");
	await page.getByRole("button", { name: /Save/i }).click();

	// Wait for update to propagate to mock store
	let updated = false;
	for (let i = 0; i < 20; i++) {
		if (notes.find((n) => n.content === "Edited content via UI.")) {
			updated = true;
			break;
		}
		await new Promise((r) => setTimeout(r, 50));
	}
	if (!updated) throw new Error("Edited content did not propagate");

	// Verify updated content visible in the list or view
	// Open view
	await page.getByLabelText("Open note Existing Note").click();
	let viewBody: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			// pick the modal's instance by selecting the second match (list + modal)
			viewBody = (page.getByText(/Edited content via UI\./i) as any).nth(1);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(viewBody).toBeVisible();

	// Delete via More menu
	await page.getByRole("button", { name: /^Close$/ }).click();
	await page.getByLabelText("More actions for note Existing Note").click();
	(globalThis as any).confirm = () => true;
	await page.getByRole("menuitem", { name: /Delete/i }).click();

	// Wait a moment and ensure note removed
	await new Promise((r) => setTimeout(r, 100));
	if (notes.find((n) => n.title === "Existing Note"))
		throw new Error("Note not deleted");
});
