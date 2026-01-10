import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";

test("Create project via UI, open it, add a card via UI, and open the card's notes", async () => {
	const createdProject = { id: "p1", name: "My Project", systemPrompt: "System" };
	const createdCard = {
		id: "c-ui-1",
		title: "Project Card UI",
		prompt: "Explain closures in JavaScript",
		status: "active",
		createdAt: new Date().toISOString(),
		project: "p1",
	};

	const api = {
		getProjects: vi.fn(() => Promise.resolve([])),
		createProject: vi.fn((payload: any) => Promise.resolve({ ...createdProject, name: payload.name, systemPrompt: payload.systemPrompt })),
		getCards: vi.fn(() => Promise.resolve([])),
		addCard: vi.fn((data: any) => Promise.resolve({ ...createdCard, ...data })),
		getNotes: vi.fn(() => Promise.resolve([])),
		createNote: vi.fn(() => Promise.resolve(null)),
		updateNote: vi.fn(() => Promise.resolve(null)),
		deleteNote: vi.fn(() => Promise.resolve(null)),
	};
	(globalThis as any).api = api;

	render(ProjectFlowTestWrapper);

	// Click "+ New Project"
	const newProjectBtn = page.getByRole("button", { name: /New Project|Create project/i });
	await expect.element(newProjectBtn).toBeVisible();
	await newProjectBtn.click();

	// Fill project form
	const nameInput = page.getByPlaceholder("e.g. JavaScript");
	await nameInput.fill("My Project");
	const systemInput = page.getByPlaceholder(/You are an expert JavaScript developer/i);
	await systemInput.fill("System");

	// Submit create
	const createBtn = page.getByRole("button", { name: /Create project/i });
	await createBtn.click();
	expect(api.createProject).toHaveBeenCalled();

	// Now in project detail, click + New Learning Item
	const newCardBtn = page.getByRole("button", { name: /New Learning Item/i });
	await expect.element(newCardBtn).toBeVisible();
	await newCardBtn.click();

	// Fill AddForm
	const titleInput = page.getByRole("textbox", { name: /Title/i });
	await titleInput.fill("Project Card UI");
	const promptInput = page.getByRole("textbox", { name: /Learning prompt/i });
	await promptInput.fill("Explain closures in JavaScript and give examples.");

	const saveBtn = page.getByRole("button", { name: /Save card/i });
	await saveBtn.click();

	// Ensure API called through cardManager.addCard
	expect(api.addCard).toHaveBeenCalled();

	// Card should appear
	const cardHeading = page.getByRole("heading", { name: /Project Card UI/i });
	await expect.element(cardHeading).toBeVisible();

	// Open the card notes
	const openNotesBtn = page.getByRole("button", { name: /Open Notes/i });
	await openNotesBtn.click();

	const notesHeading = page.getByRole("heading", { name: /Notes for Project Card UI/i });
	await expect.element(notesHeading).toBeVisible();
});