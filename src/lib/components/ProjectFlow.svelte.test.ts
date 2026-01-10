import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";
import { makeApiMock } from "./__tests__/helpers/factories";
import { addCard } from "./__tests__/helpers/flows";

test("Create project, open it, add a card, and open the card's notes", async () => {
	const _createdProject = {
		id: "p1",
		name: "My Project",
		systemPrompt: "System",
	};
	const _createdCard = {
		id: "c1",
		title: "Project Card",
		prompt: "Do the thing",
		status: "active",
		createdAt: new Date().toISOString(),
		project: "p1",
	};

	const { api } = makeApiMock({ projects: [], cards: [], notes: [] });
	(globalThis as any).api = api;

	render(ProjectFlowTestWrapper);

	// Open project create screen and create project via helper
	const newProjectBtn = page.getByRole("button", {
		name: /New Project|Create project/i,
	});
	await expect.element(newProjectBtn).toBeVisible();
	await newProjectBtn.click();

	// Fill project form
	const nameInput = page.getByPlaceholder("e.g. JavaScript");
	await nameInput.fill("My Project");
	const systemInput = page.getByPlaceholder(
		/You are an expert JavaScript developer/i,
	);
	await systemInput.fill("System");

	// Submit create
	const createBtn = page.getByRole("button", { name: /Create project/i });
	await createBtn.click();

	// Project detail should now be visible with the created project name
	const detailHeading = page.getByRole("heading", { name: /My Project/i });
	await expect.element(detailHeading).toBeVisible();

	// Add a card via UI (ensures the created project is selected properly)
	await addCard("Project Card", "Do the thing");

	// Card should appear in the list
	const cardHeading = page.getByRole("heading", { name: /Project Card/i });
	await expect.element(cardHeading).toBeVisible();

	// Open the card notes
	const openNotesBtn = page.getByRole("button", { name: /Open Notes/i });
	await openNotesBtn.click();

	// Notes modal should show for that card
	const notesHeading = page.getByRole("heading", {
		name: /Notes for Project Card/i,
	});
	await expect.element(notesHeading).toBeVisible();
});
