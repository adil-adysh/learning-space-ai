import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";

test("Edit and delete a card via UI", async () => {
	const project = { id: "pc1", name: "CardProj" };
	const initialCard = { id: "cid1", title: "Old Title", prompt: "Old prompt content", status: "active", createdAt: new Date().toISOString(), project: "pc1" };
	const api = {
		getProjects: vi.fn(() => Promise.resolve([project])),
		getCards: vi.fn(() => Promise.resolve([initialCard])),
		updateCard: vi.fn((payload: any) => Promise.resolve({ ...initialCard, ...payload })),
		deleteCard: vi.fn(() => Promise.resolve()),
	};
	(globalThis as any).api = api;

	render(ProjectFlowTestWrapper);

	// Open the project detail first
	const projectCard = page.getByRole("button", { name: /Open project CardProj/i });
	await expect.element(projectCard).toBeVisible();
	await projectCard.click();

	// Ensure card is visible
	const cardHeading = page.getByRole("heading", { name: /Old Title/i });
	await expect.element(cardHeading).toBeVisible();

	// Open More menu for card (summary element)
	const moreTrigger = page.getByLabelText("More actions for Old Title");
	await expect.element(moreTrigger).toBeVisible();
	await moreTrigger.click();
	const editMenuItem = page.getByRole("menuitem", { name: /Edit/i });
	await editMenuItem.click();

	// Edit form should appear (EditCardForm) - wait for modal heading
	const editHeading = page.getByRole("heading", { name: /Edit learning item/i });
	await expect.element(editHeading).toBeVisible();

	const titleInput = page.getByLabelText("Title").nth(0);
	await titleInput.fill("New Title");
	const saveBtn = page.getByRole("button", { name: /Save/i });
	await saveBtn.click();

	expect(api.updateCard).toHaveBeenCalled();

	// Wait for the edit modal to close and UI to stabilize before opening the menu again
	await new Promise((r) => setTimeout(r, 60));

	// Now delete via More menu (re-query trigger for updated title)
	const delTrigger2 = page.getByLabelText("More actions for New Title");
	await expect.element(delTrigger2).toBeVisible();
	await delTrigger2.click();
	const delBtn = page.getByRole("menuitem", { name: /Delete/i });
	// Stub confirm BEFORE trigger
	(globalThis as any).confirm = () => true;
	await delBtn.click();
	expect(api.deleteCard).toHaveBeenCalled();
});