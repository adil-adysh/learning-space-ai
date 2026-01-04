import type { LearningCard } from '../types';

/**
 * Card Manager using Svelte 5 Runes
 * Universal reactive state for managing learning cards
 */
class CardManager {
	// Reactive state
	all = $state<LearningCard[]>([]);
	isLoading = $state(false);
	isFormOpen = $state(false);
	
	// Filter state
	filterStatus = $state<'all' | 'active' | 'done'>('all');
	filterQuery = $state('');
	filterProject = $state('all');
	
	// Derived computed values using $derived
	get filtered(): LearningCard[] {
		let result = this.all.slice();
		
		// Filter by status
		if (this.filterStatus !== 'all') {
			result = result.filter(c => 
				this.filterStatus === 'active' ? c.status === 'active' : c.status === 'done'
			);
		}
		
		// Filter by project
		if (this.filterProject && this.filterProject !== 'all') {
			result = result.filter(c => (c.project || '') === this.filterProject);
		}
		
		// Filter by search query
		if (this.filterQuery && this.filterQuery.trim() !== '') {
			const q = this.filterQuery.toLowerCase();
			result = result.filter(c => {
				return (
					(c.title || '').toLowerCase().includes(q) ||
					(c.prompt || '').toLowerCase().includes(q) ||
					(c.topic || '').toLowerCase().includes(q) ||
					(c.project || '').toLowerCase().includes(q)
				);
			});
		}
		
		return result;
	}
	
	get activeCards(): LearningCard[] {
		return this.all.filter(c => c.status === 'active');
	}
	
	get completedCards(): LearningCard[] {
		return this.all.filter(c => c.status === 'done');
	}
	
	get cardCount(): number {
		return this.all.length;
	}
	
	/**
	 * Load all cards from Electron IPC
	 */
	async loadCards() {
		if (typeof window === 'undefined' || !(window as any).api) return;
		
		this.isLoading = true;
		try {
			const rawCards = await (window as any).api.getCards();
			const cards: LearningCard[] = rawCards
				.map((c: any) => ({
					...c,
					createdAt: new Date(c.createdAt),
				}))
				.sort((a: LearningCard, b: LearningCard) => 
					b.createdAt.getTime() - a.createdAt.getTime()
				);
			
			this.all = cards;
		} catch (err) {
			console.error('Failed to load cards:', err);
		} finally {
			this.isLoading = false;
		}
	}
	
	/**
	 * Add a new card
	 */
	async addCard(data: { title: string; prompt: string; topic?: string; project?: string }) {
		if (typeof window === 'undefined' || !(window as any).api) return;
		
		try {
			const newCard: LearningCard = await (window as any).api.addCard(data);
			this.all = [newCard, ...this.all];
			return newCard;
		} catch (err) {
			console.error('Failed to add card:', err);
			throw err;
		}
	}
	
	/**
	 * Update card status
	 */
	async updateCardStatus(id: string, status: 'active' | 'done') {
		if (typeof window === 'undefined' || !(window as any).api) return;
		
		try {
			await (window as any).api.toggleCard(id, status);
			// Update local state
			const index = this.all.findIndex(c => c.id === id);
			if (index !== -1) {
				this.all[index] = { ...this.all[index], status };
			}
		} catch (err) {
			console.error('Failed to update card status:', err);
			throw err;
		}
	}
	
	/**
	 * Run a card's prompt in ChatGPT
	 */
	async runPrompt(prompt: string) {
		if (typeof window === 'undefined' || !(window as any).api) return;
		
		try {
			await (window as any).api.runPrompt(prompt);
		} catch (err) {
			console.error('Failed to run prompt:', err);
			throw err;
		}
	}
	
	/**
	 * Toggle the add form visibility
	 */
	toggleForm() {
		this.isFormOpen = !this.isFormOpen;
	}
	
	/**
	 * Open the add form
	 */
	openForm() {
		this.isFormOpen = true;
	}
	
	/**
	 * Close the add form
	 */
	closeForm() {
		this.isFormOpen = false;
	}
	
	/**
	 * Set filter status
	 */
	setFilterStatus(status: 'all' | 'active' | 'done') {
		this.filterStatus = status;
	}
	
	/**
	 * Set filter query
	 */
	setFilterQuery(query: string) {
		this.filterQuery = query;
	}
	
	/**
	 * Set filter project
	 */
	setFilterProject(projectId: string) {
		this.filterProject = projectId;
	}
}

// Export singleton instance
export const cardManager = new CardManager();
