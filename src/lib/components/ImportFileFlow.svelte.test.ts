import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";
import { makeApiMock } from "./__tests__/helpers/factories";

test("Import modal file-upload flow: upload, validate, and import JSON file", async () => {
	// Arrange: start with empty data and mock API
	const { api } = makeApiMock({ projects: [], cards: [], notes: [] });
	// Ensure updateCard exists on the mock (used by import flow to assign project)
	(api as any).updateCard = vi.fn(async (payload: any) => {
		return {
			id: payload.id,
			title: payload.title ?? "Imported Card",
			prompt: payload.prompt ?? "",
			status: "active",
			project: payload.project,
			createdAt: new Date().toISOString(),
		};
	});
	(globalThis as any).api = api;

	// Render the app wrapper that includes the page and modal container
	render(ProjectFlowTestWrapper);

	// Create a new project so that import is project-scoped
	const newProjectBtn = page.getByRole("button", {
		name: /New Project|Create project/i,
	});
	await expect.element(newProjectBtn).toBeVisible();
	await newProjectBtn.click();

	const nameInput = page.getByPlaceholder("e.g. JavaScript");
	await nameInput.fill("Import Project");
	const systemInput = page.getByPlaceholder(
		/You are an expert JavaScript developer/i,
	);
	await systemInput.fill("System prompt");

	const createBtn = page.getByRole("button", { name: /Create project/i });
	await createBtn.click();

	// Verify project detail visible
	const detailHeading = page.getByRole("heading", { name: /Import Project/i });
	await expect.element(detailHeading).toBeVisible();

	// Prepare a temp JSON file matching LearningCardBundleV1 schema
	const bundle = {
		version: 1,
		cards: [
			{
				id: "imported-1",
				title: "Imported Card",
				prompt: "Import prompt",
				status: "active",
				createdAt: new Date().toISOString(),
			},
		],
	};

	// Open Import modal
	const importBtn = page.getByRole("button", { name: /Import/i });
	await expect.element(importBtn).toBeVisible();
	await importBtn.click();

	// Ensure file input exists and set files using an in-memory file payload
	// Set the file input directly in the browser DOM (test runs in-browser)
	const input = document.getElementById(
		"file-input",
	) as HTMLInputElement | null;
	if (!input) throw new Error("file input not found");
	const blob = new Blob([JSON.stringify(bundle)], { type: "application/json" });
	const file = new File([blob], "import.json", { type: "application/json" });
	const dt = new DataTransfer();
	dt.items.add(file);
	input.files = dt.files;
	input.dispatchEvent(new Event("change", { bubbles: true }));

	// Give the UI a tick to process FileReader
	await new Promise((r) => setTimeout(r, 50));

	// Click 'Import File' button to validate and import
	const importFileBtn = page.getByRole("button", {
		name: /Import File|Import file/i,
	});
	await expect.element(importFileBtn).toBeVisible();
	await importFileBtn.click();

	// Wait for the imported card to appear in the UI
	const importedHeading = page.getByRole("heading", { name: /Imported Card/i });
	await expect.element(importedHeading).toBeVisible();

	// Also verify API addCard was called
	expect(api.addCard).toHaveBeenCalled();
});
