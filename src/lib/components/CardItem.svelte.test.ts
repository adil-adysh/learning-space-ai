import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import CardItemTestWrapper from "./__tests__/CardItemTestWrapper.svelte";

test("CardItem Start button clickable and triggers callback", async () => {
	const card = {
		id: "c1",
		title: "Test Card",
		prompt: "Do something",
		status: "active",
		createdAt: new Date().toISOString(),
	};

	const onStart = vi.fn();
	const onToggle = vi.fn();

	render(CardItemTestWrapper, {
		props: {
			card,
			onStart,
			onToggle,
		},
	});

	const startBtn = page.getByRole("button", { name: /Start chat/i });
	await expect.element(startBtn).toBeVisible();
	await startBtn.click();

	expect(onStart).toHaveBeenCalledOnce();

	// Verify checkbox toggles status
	const toggleCheckbox = page.getByRole("checkbox", {
		name: /Mark Test Card as done/i,
	});
	await expect.element(toggleCheckbox).toBeVisible();
	await toggleCheckbox.click();
	expect(onToggle).toHaveBeenCalledOnce();
	expect(onToggle).toHaveBeenCalledWith("c1", "done");
});

test("Open Notes button shows the notes modal", async () => {
	const api = {
		getNotes: vi.fn(() => Promise.resolve([])),
		createNote: vi.fn(() => Promise.resolve(null)),
		updateNote: vi.fn(() => Promise.resolve(null)),
		deleteNote: vi.fn(() => Promise.resolve(null)),
	};

	const card = {
		id: "c2",
		title: "Notes Card",
		prompt: "Look at notes",
		status: "active",
		createdAt: new Date().toISOString(),
	};

	render(CardItemTestWrapper, {
		props: {
			card,
			onStart: () => {},
			onToggle: () => {},
			noteApi: api,
		},
	});

	const openNotes = page.getByRole("button", { name: /Open Notes/i });
	await expect.element(openNotes).toBeVisible();
	await openNotes.click();

	const modalHeading = page.getByRole("heading", {
		name: /Notes for Notes Card/i,
	});
	await expect.element(modalHeading).toBeVisible();
	expect(api.getNotes).toHaveBeenCalledWith("c2");
});
