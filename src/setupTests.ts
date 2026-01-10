import "@testing-library/jest-dom";
import { beforeEach, beforeAll, afterAll } from "vitest";
import { modalStore } from "$lib/stores/modalStore";
import { withSilentConsole } from "./test/helpers/withSilentConsole";

// Silence noisy console.debug/info logs in tests to keep CI output readable.
// Use `withSilentConsole()` in a test to temporarily restore console behavior when debugging.
let _globalConsole: { restore: () => void } | null = null;
beforeAll(() => {
	_globalConsole = withSilentConsole();
});

afterAll(() => {
	// restore console spies
	try {
		_globalConsole?.restore();
	} catch (_e) {
		// ignore
	}
});

// Ensure modal stack is cleared before each test to avoid backdrop interference
beforeEach(() => {
	try {
		modalStore.clear();
	} catch (_e) {
		// ignore in environments where modalStore isn't available
	}
});
