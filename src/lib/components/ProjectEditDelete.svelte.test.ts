import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";

test("Edit project name and delete project", async () => {
	const project = { id: "pe1", name: "EditMe", systemPrompt: "Sys" };
	const api = {
		getProjects: vi.fn(() => Promise.resolve([project])),
		getCards: vi.fn(() => Promise.resolve([])),
		updateProject: vi.fn((payload: any) => Promise.resolve({ ...project, name: payload.name })),
		deleteProject: vi.fn(() => Promise.resolve()),
	};
	(globalThis as any).api = api;

	render(ProjectFlowTestWrapper);

	// Find project's MoreMenu in the list view and click Edit
	const listMoreTrigger = page.getByLabelText("More actions for project EditMe");
	await expect.element(listMoreTrigger).toBeVisible();
	await listMoreTrigger.click();

	const menuEdit = page.getByRole("menuitem", { name: /Edit/i });
	await expect.element(menuEdit).toBeVisible();
	await menuEdit.click();

	// Now edit form should be visible - wait for modal heading
	const editHeading = page.getByRole("heading", { name: /Edit Project/i });
	await expect.element(editHeading).toBeVisible();

	const nameInput = page.getByRole("textbox", { name: /Project name/i });
	await nameInput.fill("Edited Project");
	const saveBtn = page.getByRole("button", { name: /Save/i });
	await saveBtn.click();

	expect(api.updateProject).toHaveBeenCalled();

	// Wait for edit modal to close and UI to stabilize
	await new Promise((r) => setTimeout(r, 60));

	// Now delete project via MoreMenu (re-query trigger in list view). Use updated name after edit.
	const delTrigger = page.getByLabelText("More actions for project Edited Project");
	await expect.element(delTrigger).toBeVisible();
	await delTrigger.click();
	const delBtn = page.getByRole("menuitem", { name: /Delete/i });
	// Stub confirm BEFORE triggering delete
	(globalThis as any).confirm = () => true;
	await delBtn.click();

	expect(api.deleteProject).toHaveBeenCalled();
});