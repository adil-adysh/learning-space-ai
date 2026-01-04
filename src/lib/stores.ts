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

// Filtering stores
export const filterStatus = writable<'all' | 'active' | 'done'>('all');
export const filterQuery = writable<string>('');

export const filteredCards = derived(
	[cards, filterStatus, filterQuery],
	([$cards, $status, $query]) => {
		let result = $cards.slice();
		if ($status !== 'all') {
			result = result.filter(c => ($status === 'active' ? c.status === 'active' : c.status === 'done'));
		}
		if ($query && $query.trim() !== '') {
			const q = $query.toLowerCase();
			result = result.filter(c => {
				return (
					(c.title || '').toLowerCase().includes(q) ||
					(c.prompt || '').toLowerCase().includes(q) ||
					(c.topic || '').toLowerCase().includes(q)
				);
			});
		}
		return result;
	}
);

// Helpers
export function setFilterStatus(s: 'all' | 'active' | 'done') {
	filterStatus.set(s);
}

export function setFilterQuery(q: string) {
	filterQuery.set(q);
}

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
