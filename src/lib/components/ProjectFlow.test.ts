import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Page from "../../routes/+page.svelte";
import { cardManager } from "../cardManager.svelte";

test("Create project, open it, add a card, and open the card's notes", async () => {
	const createdProject = { id: "p1", name: "My Project", systemPrompt: "System" };
	const createdCard = {
		id: "c1",
		title: "Project Card",
		prompt: "Do the thing",
		status: "active",
		createdAt: new Date().toISOString(),
		project: "p1",
	};

	const api = {
		getProjects: vi.fn(() => Promise.resolve([])),
		createProject: vi.fn((payload: any) => Promise.resolve({ ...createdProject, name: payload.name, systemPrompt: payload.systemPrompt })),
		getCards: vi.fn(() => Promise.resolve([])),
		addCard: vi.fn((data: any) => Promise.resolve({ ...createdCard, ...data })),
	};
	// Expose API on window (preload shim)
	(globalThis as any).api = api;

	render(Page);

	// Open project create screen
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

	// Ensure API called
	expect(api.createProject).toHaveBeenCalled();

	// Project detail should now be visible with the created project name
	const detailHeading = page.getByRole("heading", { name: /My Project/i });
	await expect.element(detailHeading).toBeVisible();

	// Add a card programmatically for the created project (simulates user adding a card)
	await cardManager.addCard({ title: "Project Card", prompt: "Do the thing", project: "p1" });

	// Card should appear in the list
	const cardHeading = page.getByRole("heading", { name: /Project Card/i });
	await expect.element(cardHeading).toBeVisible();

	// Open the card notes
	const openNotesBtn = page.getByRole("button", { name: /Open Notes/i });
	await openNotesBtn.click();

	// Notes modal should show for that card
	const notesHeading = page.getByRole("heading", { name: /Notes for Project Card/i });
	await expect.element(notesHeading).toBeVisible();
});