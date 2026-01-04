/**
 * AppState - Centralized application state management
 * Single source of truth for all app data
 */

import { LearningCard } from '../types';
import { eventBus, AppEvents } from './eventBus';

export interface AppState {
  cards: LearningCard[];
  isLoading: boolean;
  error: string | null;
  isFormOpen: boolean;
}

export class AppStateManager {
  private state: AppState = {
    cards: [],
    isLoading: true,
    error: null,
    isFormOpen: false,
  };

  /**
   * Get current state
   */
  getState(): Readonly<AppState> {
    return { ...this.state };
  }

  /**
   * Get specific state value
   */
  getValue<K extends keyof AppState>(key: K): AppState[K] {
    return this.state[key];
  }

  /**
   * Update state and notify subscribers
   */
  setState(updates: Partial<AppState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };

    console.log('[AppState] State updated:', {
      oldState,
      newState: this.state,
      changes: updates,
    });
  }

  /**
   * Set cards list
   */
  setCards(cards: LearningCard[]): void {
    this.setState({ cards });
    eventBus.emit('list:updated');
  }

  /**
   * Add card to list
   */
  addCard(card: LearningCard): void {
    this.setState({
      cards: [card, ...this.state.cards],
    });
    eventBus.emit('list:updated');
    eventBus.emit('card:added');
  }

  /**
   * Update card status
   */
  updateCardStatus(id: string, status: 'todo' | 'done'): void {
    const cards = this.state.cards.map((c) =>
      c.id === id ? { ...c, status } : c
    );
    this.setState({ cards });
    eventBus.emit('list:updated');
    eventBus.emit('card:toggled', { id, status });
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.setState({ isLoading });
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this.setState({ error });
  }

  /**
   * Set form visibility
   */
  setFormOpen(isOpen: boolean): void {
    this.setState({ isFormOpen: isOpen });
    if (isOpen) {
      eventBus.emit('form:open');
    } else {
      eventBus.emit('form:close');
    }
  }
}

// Singleton instance
export const appState = new AppStateManager();
