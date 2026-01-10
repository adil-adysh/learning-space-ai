import { contextBridge, ipcRenderer } from "electron";
import type {
	LearningCard,
	Project,
	RawCard,
	RawNote,
	RawProject,
	Status,
} from "./types";

function formatPreloadItem(item: unknown) {
	if (typeof item === "string") {
		return item;
	}
	if (item instanceof Error) {
		return item.stack ?? item.message;
	}
	return String(item);
}

function logPreloadError(...items: unknown[]) {
	process.stderr.write(`${items.map(formatPreloadItem).join(" ")}\n`);
}

function toLearningCard(raw: RawCard): LearningCard {
	return {
		...raw,
		createdAt: new Date(raw.createdAt),
	};
}

try {
	contextBridge.exposeInMainWorld("api", {
		getCards: async (): Promise<LearningCard[]> => {
			const raws = (await ipcRenderer.invoke("cards:get")) as RawCard[];
			return raws.map(toLearningCard);
		},
		addCard: async (data: {
			title: string;
			prompt: string;
			topic?: string;
		}): Promise<LearningCard> => {
			const raw = (await ipcRenderer.invoke("cards:add", data)) as RawCard;
			return toLearningCard(raw);
		},
		updateCard: async (payload: {
			id: string;
			title?: string;
			prompt?: string;
			topic?: string;
			project?: string;
		}): Promise<LearningCard> => {
			const raw = (await ipcRenderer.invoke(
				"cards:update",
				payload,
			)) as RawCard;
			return toLearningCard(raw);
		},
		deleteCard: async (id: string): Promise<RawCard> => {
			return (await ipcRenderer.invoke("cards:delete", id)) as RawCard;
		},
		getProjects: async (): Promise<Project[]> => {
			const list = (await ipcRenderer.invoke("projects:list")) as RawProject[];
			return list.map(
				(p): Project => ({
					...p,
					createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
				}),
			);
		},
		createProject: async (payload: {
			name: string;
			systemPrompt?: string;
		}): Promise<Project> => {
			const created = (await ipcRenderer.invoke(
				"projects:create",
				payload,
			)) as RawProject;
			return {
				...created,
				createdAt: created.createdAt ? new Date(created.createdAt) : undefined,
			};
		},
		updateProject: async (payload: {
			id: string;
			name: string;
			systemPrompt?: string;
		}): Promise<Project> => {
			const updated = (await ipcRenderer.invoke(
				"projects:update",
				payload,
			)) as RawProject;
			return {
				...updated,
				createdAt: updated.createdAt ? new Date(updated.createdAt) : undefined,
			};
		},
		deleteProject: async (id: string): Promise<RawProject> => {
			const removed = (await ipcRenderer.invoke(
				"projects:delete",
				id,
			)) as RawProject;
			return removed;
		},
		toggleCard: async (id: string, status: Status): Promise<LearningCard> => {
			const raw = (await ipcRenderer.invoke("cards:toggle", {
				id,
				status,
			})) as RawCard;
			return toLearningCard(raw);
		},
		// Notes
		getNotes: async (cardId?: string) => {
			const list = (await ipcRenderer.invoke(
				"notes:list",
				cardId,
			)) as RawNote[];
			return list.map((n) => ({
				...n,
				createdAt: new Date(n.createdAt),
				updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined,
			}));
		},
		createNote: async (payload: {
			cardId: string;
			title: string;
			content: string;
			tags?: string[];
		}) => {
			const created = (await ipcRenderer.invoke(
				"notes:create",
				payload,
			)) as RawNote;
			return {
				...created,
				createdAt: new Date(created.createdAt),
				updatedAt: created.updatedAt ? new Date(created.updatedAt) : undefined,
			};
		},
		updateNote: async (payload: {
			id: string;
			title?: string;
			content?: string;
			tags?: string[];
		}) => {
			const updated = (await ipcRenderer.invoke(
				"notes:update",
				payload,
			)) as RawNote;
			return {
				...updated,
				createdAt: new Date(updated.createdAt),
				updatedAt: updated.updatedAt ? new Date(updated.updatedAt) : undefined,
			};
		},
		deleteNote: async (id: string) => {
			const removed = (await ipcRenderer.invoke("notes:delete", id)) as RawNote;
			return removed;
		},
		runPrompt: async (prompt: string): Promise<void> => {
			await ipcRenderer.invoke("cards:run", prompt);
		},
	});
} catch (err) {
	logPreloadError("[preload] Failed to expose API:", err);
}
