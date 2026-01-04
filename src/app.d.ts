// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	
	interface Window {
		api: {
			getCards(): Promise<import('./types').LearningCard[]>;
			addCard(data: { title: string; prompt: string; topic?: string }): Promise<import('./types').LearningCard>;
			toggleCard(id: string, status: import('./types').Status): Promise<import('./types').LearningCard>;
			runPrompt(prompt: string): Promise<void>;
		};
	}
}

export {};
