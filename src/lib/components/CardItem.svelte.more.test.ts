import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import CardItem from "./CardItem.svelte";

test("More menu Edit/Delete dispatch actions", async () => {
	const card = {
		id: "c1",
		title: "Test Card",
		prompt: "Do something",
		status: "active",
		createdAt: new Date().toISOString(),
	};

	const onStart = vi.fn();
	const onToggle = vi.fn();
	const onEdit = vi.fn();
	const onDelete = vi.fn();

	render(CardItem, {
		props: {
			card,
			onStart,
			onToggle,
			onEdit,
			onDelete,
		},
	});

	const moreBtn = page.getByRole("button", {
		name: /More actions for Test Card/i,
	});
	await expect.element(moreBtn).toBeVisible();
	await moreBtn.click();

	const editItem = page.getByRole("button", { name: /Edit/i });
	await expect.element(editItem).toBeVisible();
	await editItem.click();
	expect(onEdit).toHaveBeenCalledOnce();

	// Re-open and click Delete
	await moreBtn.click();
	const deleteItem = page.getByRole("button", { name: /Delete/i });
	await expect.element(deleteItem).toBeVisible();
	await deleteItem.click();
	expect(onDelete).toHaveBeenCalledOnce();
});
