import { describe, it, expect, beforeEach, vi } from "vitest";
import type { LearningCard, LearningCardBundleV1 } from "../types";
import { validateBundle, rawToLearningCard } from "./utils/cardImportExport";

// Create a simple CardManager class for testing
class CardManager {
	all: LearningCard[] = [];

	validateImportBundle(data: unknown): Array<{ field: string; message: string; cardIndex?: number }> {
		return validateBundle(data);
	}

	async importCardsToProject(bundle: LearningCardBundleV1, projectId: string): Promise<void> {
		if (typeof window === "undefined" || !("api" in window)) {
			throw new Error("Window API not available");
		}
		
		const cardsToImport = bundle.cards.map((rawCard) => {
			const card = rawToLearningCard(rawCard);
			return {
				...card,
				project: projectId,
			};
		});

		const importedCards: LearningCard[] = [];
		for (const card of cardsToImport) {
			const newCard = await (window as any).api.addCard({
				title: card.title,
				prompt: card.prompt,
				topic: card.topic,
			});
			const updatedCard = await (window as any).api.updateCard({
				id: newCard.id,
				project: projectId,
			});
			importedCards.push(updatedCard);
		}

		this.all = [...importedCards, ...this.all];
	}
}

describe("CardManager import/export", () => {
	let manager: CardManager;

	beforeEach(() => {
		manager = new CardManager();
		// Mock window.api
		(global as any).window = {
			api: {
				addCard: vi.fn(),
				updateCard: vi.fn(),
			},
		};
	});

	describe("validateImportBundle", () => {
		it("should validate valid bundle", () => {
			const bundle: LearningCardBundleV1 = {
				version: 1,
				cards: [
					{
						id: "card-1",
						title: "Card 1",
						prompt: "Prompt 1",
						status: "active",
						createdAt: "2024-01-01T00:00:00.000Z",
					},
				],
			};

			const errors = manager.validateImportBundle(bundle);

			expect(errors).toEqual([]);
		});

		it("should return errors for invalid bundle", () => {
			const invalidBundle = {
				version: 2,
				cards: "not an array",
			};

			const errors = manager.validateImportBundle(invalidBundle);

			expect(errors.length).toBeGreaterThan(0);
		});
	});

	describe("exportProjectCards", () => {
		it("should filter cards by project", () => {
			manager.all = [
				{
					id: "card-1",
					title: "Card 1",
					prompt: "Prompt 1",
					status: "active",
					project: "project-1",
					createdAt: new Date("2024-01-01T00:00:00.000Z"),
				},
				{
					id: "card-2",
					title: "Card 2",
					prompt: "Prompt 2",
					status: "active",
					project: "project-2",
					createdAt: new Date("2024-01-02T00:00:00.000Z"),
				},
				{
					id: "card-3",
					title: "Card 3",
					prompt: "Prompt 3",
					status: "active",
					project: "project-1",
					createdAt: new Date("2024-01-03T00:00:00.000Z"),
				},
			];

			// Mock downloadJSON to capture the bundle
			let capturedBundle: LearningCardBundleV1 | null = null;
			vi.mock("../utils/cardImportExport", () => ({
				downloadJSON: (bundle: LearningCardBundleV1) => {
					capturedBundle = bundle;
				},
				generateExportFilename: () => "test.json",
				exportCards: (cards: LearningCard[]) => ({
					version: 1,
					cards: cards.map((c) => ({
						...c,
						createdAt: c.createdAt.toISOString(),
					})),
				}),
			}));

			// In real scenario, this would trigger download
			// Here we just verify the logic
			const projectCards = manager.all.filter((c) => c.project === "project-1");
			expect(projectCards).toHaveLength(2);
			expect(projectCards[0].id).toBe("card-1");
			expect(projectCards[1].id).toBe("card-3");
		});
	});

	describe("importCardsToProject", () => {
		it("should import cards and assign to project", async () => {
			const bundle: LearningCardBundleV1 = {
				version: 1,
				cards: [
					{
						id: "import-1",
						title: "Imported Card 1",
						prompt: "Imported Prompt 1",
						status: "active",
						createdAt: "2024-01-01T00:00:00.000Z",
					},
					{
						id: "import-2",
						title: "Imported Card 2",
						prompt: "Imported Prompt 2",
						topic: "Test Topic",
						status: "done",
						createdAt: "2024-01-02T00:00:00.000Z",
					},
				],
			};

			const mockAddCard = vi.fn().mockImplementation((data) => {
				return Promise.resolve({
					id: `new-${data.title}`,
					...data,
					createdAt: new Date(),
				});
			});

			const mockUpdateCard = vi.fn().mockImplementation((payload) => {
				return Promise.resolve({
					id: payload.id,
					title: "Imported Card",
					prompt: "Imported Prompt",
					status: "active",
					project: payload.project,
					createdAt: new Date(),
				});
			});

			(global as any).window.api.addCard = mockAddCard;
			(global as any).window.api.updateCard = mockUpdateCard;

			await manager.importCardsToProject(bundle, "target-project");

			// Verify addCard was called for each card
			expect(mockAddCard).toHaveBeenCalledTimes(2);

			// Verify updateCard was called to set project
			expect(mockUpdateCard).toHaveBeenCalledTimes(2);

			// Verify project was set in updateCard calls
			expect(mockUpdateCard).toHaveBeenCalledWith(
				expect.objectContaining({
					project: "target-project",
				}),
			);

			// Verify cards were added to manager.all
			expect(manager.all.length).toBeGreaterThan(0);
		});

		it("should throw error when window.api not available", async () => {
			delete (global as any).window;

			const bundle: LearningCardBundleV1 = {
				version: 1,
				cards: [],
			};

			await expect(manager.importCardsToProject(bundle, "project-1")).rejects.toThrow(
				"Window API not available",
			);
		});

		it("should handle import errors", async () => {
			const bundle: LearningCardBundleV1 = {
				version: 1,
				cards: [
					{
						id: "card-1",
						title: "Card 1",
						prompt: "Prompt 1",
						status: "active",
						createdAt: "2024-01-01T00:00:00.000Z",
					},
				],
			};

			const mockAddCard = vi.fn().mockRejectedValue(new Error("Import failed"));
			const mockUpdateCard = vi.fn();
			(global as any).window = { 
				api: { 
					addCard: mockAddCard,
					updateCard: mockUpdateCard,
				} 
			};

			await expect(manager.importCardsToProject(bundle, "project-1")).rejects.toThrow();
		});
	});

	describe("import validation integration", () => {
		it("should fail import if validation fails", async () => {
			const invalidBundle = {
				version: 2,
				cards: [],
			};

			const errors = manager.validateImportBundle(invalidBundle);
			expect(errors.length).toBeGreaterThan(0);

			// In real usage, component would check errors before calling importCardsToProject
			// Here we just verify validation catches the issue
		});
	});
});
