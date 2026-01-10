import { vi } from "vitest";

export function withSilentConsole() {
	const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
	const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

	return {
		restore() {
			try {
				debugSpy.mockRestore();
			} catch (_e) {
				// ignore
			}
			try {
				infoSpy.mockRestore();
			} catch (_e) {
				// ignore
			}
		},
	};
}
