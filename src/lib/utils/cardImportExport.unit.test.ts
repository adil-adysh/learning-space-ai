import { describe, it, expect } from "vitest";
import type { LearningCard, RawCard, LearningCardBundleV1 } from "../../types";
import {
	learningCardToRaw,
	rawToLearningCard,
	exportCards,
	validateBundle,
	generateExportFilename,
	getBundleJsonString,
} from "./cardImportExport";

describe("cardImportExport utilities", () => {
	describe("learningCardToRaw", () => {
		it("should convert LearningCard to RawCard", () => {
			const card: LearningCard = {
				id: "test-id",
				title: "Test Card",
				prompt: "Test prompt",
				topic: "Test topic",
				project: "project-id",
				status: "active",
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
			};

			const raw = learningCardToRaw(card);

			expect(raw).toEqual({
				id: "test-id",
				title: "Test Card",
				prompt: "Test prompt",
				topic: "Test topic",
				project: "project-id",
				status: "active",
				createdAt: "2024-01-01T00:00:00.000Z",
			});
		});

		it("should handle optional fields", () => {
			const card: LearningCard = {
				id: "test-id",
				title: "Test Card",
				prompt: "Test prompt",
				status: "done",
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
			};

			const raw = learningCardToRaw(card);

			expect(raw.topic).toBeUndefined();
			expect(raw.project).toBeUndefined();
		});
	});

	describe("rawToLearningCard", () => {
		it("should convert RawCard to LearningCard", () => {
			const raw: RawCard = {
				id: "test-id",
				title: "Test Card",
				prompt: "Test prompt",
				topic: "Test topic",
				project: "project-id",
				status: "active",
				createdAt: "2024-01-01T00:00:00.000Z",
			};

			const card = rawToLearningCard(raw);

			expect(card.id).toBe("test-id");
			expect(card.title).toBe("Test Card");
			expect(card.createdAt).toBeInstanceOf(Date);
			expect(card.createdAt.toISOString()).toBe("2024-01-01T00:00:00.000Z");
		});
	});

	describe("exportCards", () => {
		it("should create valid LearningCardBundleV1", () => {
			const cards: LearningCard[] = [
				{
					id: "card-1",
					title: "Card 1",
					prompt: "Prompt 1",
					status: "active",
					createdAt: new Date("2024-01-01T00:00:00.000Z"),
				},
				{
					id: "card-2",
					title: "Card 2",
					prompt: "Prompt 2",
					topic: "Topic 2",
					project: "proj-1",
					status: "done",
					createdAt: new Date("2024-01-02T00:00:00.000Z"),
				},
			];

			const bundle = exportCards(cards);

			expect(bundle.version).toBe(1);
			expect(bundle.cards).toHaveLength(2);
			expect(bundle.cards[0].createdAt).toBe("2024-01-01T00:00:00.000Z");
			expect(bundle.cards[1].createdAt).toBe("2024-01-02T00:00:00.000Z");
		});

		it("should handle empty card array", () => {
			const bundle = exportCards([]);

			expect(bundle.version).toBe(1);
			expect(bundle.cards).toEqual([]);
		});
	});

	describe("validateBundle", () => {
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

			const errors = validateBundle(bundle);

			expect(errors).toEqual([]);
		});

		it("should reject non-object input", () => {
			const errors = validateBundle("not an object");

			expect(errors).toHaveLength(1);
			expect(errors[0].field).toBe("root");
		});

		it("should reject null input", () => {
			const errors = validateBundle(null);

			expect(errors).toHaveLength(1);
			expect(errors[0].field).toBe("root");
		});

		it("should reject missing version", () => {
			const bundle = {
				cards: [],
			};

			const errors = validateBundle(bundle);

			expect(errors.some((e) => e.field === "version")).toBe(true);
		});

		it("should reject wrong version", () => {
			const bundle = {
				version: 2,
				cards: [],
			};

			const errors = validateBundle(bundle);

			expect(errors.some((e) => e.field === "version")).toBe(true);
		});

		it("should reject missing cards array", () => {
			const bundle = {
				version: 1,
			};

			const errors = validateBundle(bundle);

			expect(errors.some((e) => e.field === "cards")).toBe(true);
		});

		it("should reject non-array cards", () => {
			const bundle = {
				version: 1,
				cards: "not an array",
			};

			const errors = validateBundle(bundle);

			expect(errors.some((e) => e.field === "cards")).toBe(true);
		});

		it("should validate required card fields", () => {
			const bundle = {
				version: 1,
				cards: [
					{
						// Missing all required fields
					},
				],
			};

			const errors = validateBundle(bundle);

			expect(errors.some((e) => e.field === "id" && e.cardIndex === 0)).toBe(
				true,
			);
			expect(errors.some((e) => e.field === "title" && e.cardIndex === 0)).toBe(
				true,
			);
			expect(
				errors.some((e) => e.field === "prompt" && e.cardIndex === 0),
			).toBe(true);
			expect(
				errors.some((e) => e.field === "status" && e.cardIndex === 0),
			).toBe(true);
			expect(
				errors.some((e) => e.field === "createdAt" && e.cardIndex === 0),
			).toBe(true);
		});

		it("should reject invalid status", () => {
			const bundle = {
				version: 1,
				cards: [
					{
						id: "card-1",
						title: "Card 1",
						prompt: "Prompt 1",
						status: "invalid-status",
						createdAt: "2024-01-01T00:00:00.000Z",
					},
				],
			};

			const errors = validateBundle(bundle);

			expect(
				errors.some((e) => e.field === "status" && e.cardIndex === 0),
			).toBe(true);
		});

		it("should reject invalid date format", () => {
			const bundle = {
				version: 1,
				cards: [
					{
						id: "card-1",
						title: "Card 1",
						prompt: "Prompt 1",
						status: "active",
						createdAt: "not a date",
					},
				],
			};

			const errors = validateBundle(bundle);

			expect(
				errors.some((e) => e.field === "createdAt" && e.cardIndex === 0),
			).toBe(true);
		});

		it("should validate multiple cards", () => {
			const bundle = {
				version: 1,
				cards: [
					{
						id: "card-1",
						title: "Card 1",
						prompt: "Prompt 1",
						status: "active",
						createdAt: "2024-01-01T00:00:00.000Z",
					},
					{
						// Invalid card
						id: "card-2",
						title: "Card 2",
						// missing prompt
						status: "invalid",
						createdAt: "invalid-date",
					},
				],
			};

			const errors = validateBundle(bundle);

			// Should have errors for card at index 1
			expect(errors.some((e) => e.cardIndex === 1)).toBe(true);
			// Should not have errors for card at index 0
			expect(errors.some((e) => e.cardIndex === 0)).toBe(false);
		});

		it("should accept valid optional fields", () => {
			const bundle: LearningCardBundleV1 = {
				version: 1,
				cards: [
					{
						id: "card-1",
						title: "Card 1",
						prompt: "Prompt 1",
						topic: "Topic 1",
						project: "project-1",
						status: "active",
						createdAt: "2024-01-01T00:00:00.000Z",
					},
				],
			};

			const errors = validateBundle(bundle);

			expect(errors).toEqual([]);
		});

		it("should reject invalid optional field types", () => {
			const bundle = {
				version: 1,
				cards: [
					{
						id: "card-1",
						title: "Card 1",
						prompt: "Prompt 1",
						topic: 123, // should be string
						project: true, // should be string
						status: "active",
						createdAt: "2024-01-01T00:00:00.000Z",
					},
				],
			};

			const errors = validateBundle(bundle);

			expect(errors.some((e) => e.field === "topic")).toBe(true);
			expect(errors.some((e) => e.field === "project")).toBe(true);
		});
	});

	describe("generateExportFilename", () => {
		it("should sanitize project name", () => {
			const filename = generateExportFilename("My Project!");

			expect(filename).toBe("my-project-learning-cards.json");
		});

		it("should handle special characters", () => {
			const filename = generateExportFilename("Test @ #Project$ 123");

			expect(filename).toBe("test-project-123-learning-cards.json");
		});

		it("should collapse multiple dashes", () => {
			const filename = generateExportFilename("Test   ---   Project");

			expect(filename).toBe("test-project-learning-cards.json");
		});

		it("should remove leading and trailing dashes", () => {
			const filename = generateExportFilename("---Project---");

			expect(filename).toBe("project-learning-cards.json");
		});
	});

	describe("import/export symmetry", () => {
		it("exported bundle should import without modification", () => {
			const originalCards: LearningCard[] = [
				{
					id: "card-1",
					title: "Card 1",
					prompt: "Prompt 1",
					topic: "Topic 1",
					project: "project-1",
					status: "active",
					createdAt: new Date("2024-01-01T00:00:00.000Z"),
				},
				{
					id: "card-2",
					title: "Card 2",
					prompt: "Prompt 2",
					status: "done",
					createdAt: new Date("2024-01-02T00:00:00.000Z"),
				},
			];

			// Export
			const bundle = exportCards(originalCards);

			// Validate (should pass)
			const errors = validateBundle(bundle);
			expect(errors).toEqual([]);

			// Import
			const importedCards = bundle.cards.map(rawToLearningCard);

			// Also verify getBundleJsonString produces valid JSON
			const jsonString = getBundleJsonString(bundle as any);
			expect(() => JSON.parse(jsonString)).not.toThrow();

			// Verify symmetry
			expect(importedCards).toHaveLength(originalCards.length);
			importedCards.forEach((imported, index) => {
				const original = originalCards[index];
				expect(imported.id).toBe(original.id);
				expect(imported.title).toBe(original.title);
				expect(imported.prompt).toBe(original.prompt);
				expect(imported.topic).toBe(original.topic);
				expect(imported.project).toBe(original.project);
				expect(imported.status).toBe(original.status);
				expect(imported.createdAt.toISOString()).toBe(
					original.createdAt.toISOString(),
				);
			});
		});
	});
});
