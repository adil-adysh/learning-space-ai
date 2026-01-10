export type Status = "active" | "done";

// Public model used in renderer and app logic
export type LearningCard = {
	id: string;
	title: string;
	prompt: string;
	topic?: string;
	project?: string; // optional project id the card belongs to
	status: Status;
	createdAt: Date;
};

// Raw model used for JSON storage
export type RawCard = {
	id: string;
	title: string;
	prompt: string;
	topic?: string;
	project?: string; // project id
	status: Status;
	createdAt: string; // ISO
};

// Project model
export type Project = {
	id: string;
	name: string;
	systemPrompt?: string; // Optional system prompt that prepends to all cards in this project
	createdAt?: Date;
};

export type RawProject = {
	id: string;
	name: string;
	systemPrompt?: string;
	createdAt?: string;
};

// Notes attached to LearningCard
export type Note = {
	id: string;
	cardId: string;
	title: string;
	content: string;
	tags?: string[]; // simple string tags
	createdAt: Date;
	updatedAt?: Date;
};

export type RawNote = {
	id: string;
	cardId: string;
	title: string;
	content: string;
	tags?: string[];
	createdAt: string; // ISO
	updatedAt?: string;
};

// Export API types used by components
export type NoteApi = {
	getNotes: (cardId: string) => Promise<Note[]>;
	createNote: (payload: {
		cardId: string;
		title: string;
		content: string;
		tags: string[];
	}) => Promise<Note>;
	updateNote: (payload: {
		id: string;
		title?: string;
		content?: string;
		tags?: string[];
	}) => Promise<Note>;
	deleteNote: (id: string) => Promise<void>;
};
