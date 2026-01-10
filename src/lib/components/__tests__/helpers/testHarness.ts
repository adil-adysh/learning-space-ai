import { render } from "vitest-browser-svelte";
import RenderWithModal from "./RenderWithModal.svelte";
import type { ComponentType } from "svelte";

export function renderWithModal(component: ComponentType, props: Record<string, unknown> = {}) {
	return render(RenderWithModal, { props: { component, props } });
}

export function renderPageWrapper() {
	// convenience to render the full page inside modal shell
	const PageWrapper = require("./PageTestWrapper.svelte").default;
	return render(PageWrapper);
}
