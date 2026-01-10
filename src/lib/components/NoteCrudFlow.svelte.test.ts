import { test, expect } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import ProjectFlowTestWrapper from "./__tests__/ProjectFlowTestWrapper.svelte";
import { makeApiMock } from "./__tests__/helpers/factories";
import { createProject, addCard } from "./__tests__/helpers/flows";

test("Full note CRUD flow: create, view, edit, delete", async () => {
	const _createdProject = {
		id: "p-crud",
		name: "CRUDProj",
		systemPrompt: "Sys",
	};
	const _createdCard = {
		id: "c-crud-1",
		title: "CRUD Card",
		prompt: "Explain promises",
		status: "active",
		createdAt: new Date().toISOString(),
		project: "p-crud",
	};

	const { api, internal } = makeApiMock({ notes: [] });
	(globalThis as any).api = api;

	render(ProjectFlowTestWrapper);

	// Create project
	await createProject("CRUDProj", "Sys");

	// Add a learning card
	await addCard("CRUD Card", "Explain promises");

	// Add a learning card
	await page.getByRole("button", { name: /New Learning Item/i }).click();
	await page.getByRole("textbox", { name: /Title/i }).fill("CRUD Card");
	await page
		.getByRole("textbox", { name: /Learning prompt/i })
		.fill("Explain promises");
	await page.getByRole("button", { name: /Save card/i }).click();

	// Open notes and create a note
	await (page.getByLabelText("Open notes for CRUD Card") as any)
		.first()
		.click();
	await page.getByRole("button", { name: /New Note/i }).click();
	await page.getByRole("textbox", { name: /Title/i }).fill("Note CRUD Title");
	await page
		.getByRole("textbox", { name: /Content|Content/ })
		.fill("**Initial Bold**\n\n`inline code`\n\n- list item");
	await page.getByRole("button", { name: /Save/i }).click();

	// Wait for the note to be present
	for (let i = 0; i < 20; i++) {
		const ns = await api.getNotes();
		if (ns.length > 0) break;
		await new Promise((r) => setTimeout(r, 100));
	}

	if (typeof window !== "undefined") {
		const createdCardId = internal.cards[0]?.id;
		window.dispatchEvent(
			new CustomEvent("notes:changed", { detail: { cardId: createdCardId } }),
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
	// the heading we found belongs to the opened note view; use broader locators but pick the second match (view) to avoid the list preview duplicate
	let bodyEl: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			// pick the second occurrence which corresponds to the modal view
			bodyEl = (page.getByText(/Initial Bold/i) as any).nth(1);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(bodyEl).toBeVisible();

	let codeEl: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			codeEl = (page.getByText(/inline code/i) as any).nth(1);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(codeEl).toBeVisible();

	let listEl: any = null;
	for (let i = 0; i < 20; i++) {
		try {
			listEl = (page.getByText(/list item/i) as any).nth(1);
			break;
		} catch (_err) {
			await new Promise((r) => setTimeout(r, 50));
		}
	}
	await expect.element(listEl).toBeVisible();

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
			// check internal mock store for the updated content
			if (internal.notes.find((n) => n.content === "Updated body.")) {
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
	if (internal.notes.find((n) => n.title === "Note CRUD Title"))
		throw new Error("Note not deleted");
});
