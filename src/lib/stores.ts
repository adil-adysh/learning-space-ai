import { writable, derived } from 'svelte/store';
import type { LearningCard } from '../types';

/**
 * Reactive Svelte stores for application state
 * Replaces the AppStateManager class with Svelte's reactive primitives
 */

export const cards = writable<LearningCard[]>([]);
export const isFormOpen = writable<boolean>(false);
export const isLoading = writable<boolean>(false);

// Derived stores
export const cardCount = derived(cards, ($cards) => $cards.length);
export const activeCards = derived(cards, ($cards) => 
	$cards.filter(c => c.status === 'active')
);
export const completedCards = derived(cards, ($cards) => 
	$cards.filter(c => c.status === 'done')
);

// Helper functions to update stores
export function addCard(card: LearningCard) {
	cards.update(current => [card, ...current]);
}

export function updateCardStatus(id: string, status: 'active' | 'done') {
	cards.update(current => 
		current.map(card => card.id === id ? { ...card, status } : card)
	);
}

export function setCards(newCards: LearningCard[]) {
	cards.set(newCards);
}
