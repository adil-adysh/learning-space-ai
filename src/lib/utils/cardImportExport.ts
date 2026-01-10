import type {
	LearningCard,
	RawCard,
	LearningCardBundleV1,
	ValidationError,
} from "../../types";

/**
 * Convert LearningCard to RawCard (Date -> ISO string)
 */
export function learningCardToRaw(card: LearningCard): RawCard {
	return {
		id: card.id,
		title: card.title,
		prompt: card.prompt,
		topic: card.topic,
		project: card.project,
		status: card.status,
		createdAt: card.createdAt.toISOString(),
	};
}

/**
 * Convert RawCard to LearningCard (ISO string -> Date)
 */
export function rawToLearningCard(raw: RawCard): LearningCard {
	return {
		id: raw.id,
		title: raw.title,
		prompt: raw.prompt,
		topic: raw.topic,
		project: raw.project,
		status: raw.status,
		createdAt: new Date(raw.createdAt),
	};
}

/**
 * Export cards to LearningCardBundleV1 format
 */
export function exportCards(cards: LearningCard[]): LearningCardBundleV1 {
	return {
		version: 1,
		cards: cards.map(learningCardToRaw),
	};
}

/**
 * Validate imported bundle structure and content
 * Returns array of validation errors (empty if valid)
 */
export function validateBundle(data: unknown): ValidationError[] {
	const errors: ValidationError[] = [];

	// Check if data exists
	if (!data || typeof data !== "object") {
		errors.push({ field: "root", message: "Invalid JSON: expected an object" });
		return errors;
	}

	const bundle = data as Record<string, unknown>;

	// Check version
	if (bundle.version !== 1) {
		errors.push({
			field: "version",
			message: "Invalid or missing version (expected: 1)",
		});
	}

	// Check cards array
	if (!Array.isArray(bundle.cards)) {
		errors.push({
			field: "cards",
			message: "Missing or invalid 'cards' array",
		});
		return errors;
	}

	// Validate each card
	bundle.cards.forEach((card, index) => {
		if (!card || typeof card !== "object") {
			errors.push({
				field: "card",
				message: `Card at index ${index} is not an object`,
				cardIndex: index,
			});
			return;
		}

		const c = card as Record<string, unknown>;

		// Required fields
		if (!c.id || typeof c.id !== "string") {
			errors.push({
				field: "id",
				message: `Card at index ${index} missing or invalid 'id'`,
				cardIndex: index,
			});
		}

		if (!c.title || typeof c.title !== "string") {
			errors.push({
				field: "title",
				message: `Card at index ${index} missing or invalid 'title'`,
				cardIndex: index,
			});
		}

		if (!c.prompt || typeof c.prompt !== "string") {
			errors.push({
				field: "prompt",
				message: `Card at index ${index} missing or invalid 'prompt'`,
				cardIndex: index,
			});
		}

		if (!c.status || (c.status !== "active" && c.status !== "done")) {
			errors.push({
				field: "status",
				message: `Card at index ${index} has invalid 'status' (must be 'active' or 'done')`,
				cardIndex: index,
			});
		}

		if (!c.createdAt || typeof c.createdAt !== "string") {
			errors.push({
				field: "createdAt",
				message: `Card at index ${index} missing or invalid 'createdAt'`,
				cardIndex: index,
			});
		} else {
			// Validate ISO date format
			const date = new Date(c.createdAt);
			if (Number.isNaN(date.getTime())) {
				errors.push({
					field: "createdAt",
					message: `Card at index ${index} has invalid date format in 'createdAt'`,
					cardIndex: index,
				});
			}
		}

		// Optional fields validation
		if (c.topic !== undefined && typeof c.topic !== "string") {
			errors.push({
				field: "topic",
				message: `Card at index ${index} has invalid 'topic' (must be string)`,
				cardIndex: index,
			});
		}

		if (c.project !== undefined && typeof c.project !== "string") {
			errors.push({
				field: "project",
				message: `Card at index ${index} has invalid 'project' (must be string)`,
				cardIndex: index,
			});
		}
	});

	return errors;
}

/**
 * Trigger browser download of JSON file
 */
export function downloadJSON(
	data: LearningCardBundleV1,
	filename: string,
): void {
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Generate filename for export
 */
export function generateExportFilename(projectName: string): string {
	// Sanitize project name for filename
	const sanitized = projectName
		.replace(/[^a-z0-9]/gi, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
		.toLowerCase();

	return `${sanitized}-learning-cards.json`;
}

export function getBundleJsonString(bundle: LearningCardBundleV1): string {
	return JSON.stringify(bundle, null, 2);
}
