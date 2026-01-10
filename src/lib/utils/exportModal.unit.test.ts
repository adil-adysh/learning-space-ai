import { describe, it, expect } from "vitest";
import type { LearningCard } from "../../types";
import { exportCards, generateExportFilename } from "./cardImportExport";

describe("Export modal helper functions", () => {
	it("exportCards returns bundle with version and cards", () => {
		const cards: LearningCard[] = [
			{
				id: "c1",
				title: "T1",
				prompt: "p1",
				status: "active",
				createdAt: new Date(),
			},
		];
		const bundle = exportCards(cards);
		expect(bundle.version).toBe(1);
		expect(bundle.cards).toHaveLength(1);
	});

	it("generateExportFilename produces sanitized filename", () => {
		expect(generateExportFilename("My Project!")).toBe(
			"my-project-learning-cards.json",
		);
	});
});
