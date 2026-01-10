import { vi } from "vitest";
import type { Note, LearningCard, Project } from "$lib/types";
import { modalStore } from "$lib/stores/modalStore";

export function makeNote(overrides: Partial<Note> = {}): Note {
	return {
		id: overrides.id ?? `n-${Math.random().toString(36).slice(2, 8)}`,
		cardId: overrides.cardId ?? "c1",
		title: overrides.title ?? "Note",
		content: overrides.content ?? "",
		tags: overrides.tags ?? [],
		createdAt: overrides.createdAt ?? new Date(),
	};
}

export function makeCard(overrides: Record<string, unknown> = {}) {
	return {
		id: overrides.id ?? "c1",
		title: overrides.title ?? "Card",
		prompt: overrides.prompt ?? "",
		status: overrides.status ?? "active",
		createdAt: overrides.createdAt ?? new Date(),
		project: overrides.project ?? "p1",
	};
}

export function makeProject(overrides: Record<string, unknown> = {}) {
	return {
		id: overrides.id ?? "p1",
		name: overrides.name ?? "Project",
		systemPrompt: overrides.systemPrompt ?? "",
	};
}

export function resetModalStore() {
	// ensure modal stack is cleared between tests
	modalStore.close();
}

export function makeApiMock(initial: { notes?: Note[]; cards?: LearningCard[]; projects?: Project[] } = {}) {
	const notes = (initial.notes || []).slice();
	const cards = (initial.cards || []).slice();
	const projects = (initial.projects || []).slice();

	const api: {
		getNotes: (cardId: string) => Promise<Note[]>;
		createNote: (payload: { cardId: string; title: string; content: string; tags: string[] }) => Promise<Note>;
		updateNote: (payload: { id: string; title?: string; content?: string; tags?: string[] }) => Promise<Note>;
		deleteNote: (id: string) => Promise<void>;
		getProjects: () => Promise<Project[]>;
		createProject: (p: { id?: string; name: string; systemPrompt?: string }) => Promise<Project>;
		getCards: () => Promise<LearningCard[]>;
		addCard: (c: Partial<LearningCard>) => Promise<LearningCard>;
	} = {
		getNotes: vi.fn(async (cardId: string) => Promise.resolve(notes.filter((n: Note) => n.cardId === cardId))),
		createNote: vi.fn(async (payload: { cardId: string; title: string; content: string; tags: string[] }) => {
			const created: Note = { id: `n-${Date.now()}`, ...payload, createdAt: new Date() } as Note;
			notes.push(created);
			return created;
		}),
		updateNote: vi.fn(async (payload: { id: string; title?: string; content?: string; tags?: string[] }) => {
			const idx = notes.findIndex((n) => n.id === payload.id);
			if (idx !== -1) {
				notes[idx] = { ...notes[idx], ...(payload as Partial<Note>) } as Note;
				return notes[idx];
			}
			return payload as unknown as Note;
		}),
		deleteNote: vi.fn(async (id: string) => {
			const idx = notes.findIndex((n) => n.id === id);
			if (idx !== -1) notes.splice(idx, 1);
			return;
		}),
		getProjects: vi.fn(async () => Promise.resolve(projects)),
		createProject: vi.fn(async (p: { id?: string; name: string; systemPrompt?: string }) => {
			const created: Project = { id: `p-${Date.now()}`, ...p } as Project;
			projects.push(created);
			return created;
		}),
		getCards: vi.fn(async () => Promise.resolve(cards)),
		addCard: vi.fn(async (c: Partial<LearningCard>) => {
			const created: LearningCard = {
				id: `c-${Date.now()}`,
				title: (c.title as string) ?? "",
				prompt: (c.prompt as string) ?? "",
				status: (c.status as "active" | "done") ?? "active",
				project: (c.project as string) ?? "p1",
				topic: (c.topic as string) ?? "",
				createdAt: (c.createdAt as Date) ?? new Date(),
			} as LearningCard;
			cards.push(created);
			return created;
		}),
	};

	return { api, internal: { notes, cards, projects } };
} 
