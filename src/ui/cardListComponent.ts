/**
 * CardList Component - Class-based with dependency injection
 * Manages rendering and updating of learning card list
 */

import { LearningCard } from '../types';
import { createCardItem } from './cardItem';
import { eventBus } from './eventBus';
import { appState } from './appState';

export interface CardListDependencies {
  onCardStart: (card: LearningCard) => Promise<void>;
  onCardToggle: (card: LearningCard) => Promise<void>;
}

export class CardList {
  private container: HTMLDivElement | null;

  constructor(private dependencies: CardListDependencies) {
    this.container = document.querySelector('#cards') as HTMLDivElement | null;

    if (!this.container) {
      throw new Error('CardList: container #cards not found');
    }

    // Subscribe to app events
    this.subscribeToEvents();

    console.log('[CardList] Component initialized');
  }

  /**
   * Subscribe to app events
   */
  private subscribeToEvents(): void {
    eventBus.on('list:updated', () => {
      console.log('[CardList] Event: list:updated received');
      this.render();
    });

    eventBus.on('card:added', () => {
      console.log('[CardList] Event: card:added received');
    });

    eventBus.on('card:toggled', ({ id, status }) => {
      console.log('[CardList] Event: card:toggled received:', { id, status });
    });
  }

  /**
   * Render the card list
   */
  render(): void {
    console.log('[CardList] Rendering cards');

    if (!this.container) return;

    // Save currently focused element ID
    const activeId = document.activeElement?.id;
    console.log('[CardList] Current focused element:', activeId);

    // Clear container
    this.container.innerHTML = '';

    // Get cards from app state
    const cards = appState.getValue('cards');

    // Handle empty state
    if (cards.length === 0) {
      console.log('[CardList] Rendering empty state');
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.setAttribute('role', 'status');
      empty.textContent = 'No learning cards yet. Add your first thought above.';
      this.container.appendChild(empty);
      return;
    }

    // Render cards
    console.log(`[CardList] Rendering ${cards.length} cards`);
    const fragment = document.createDocumentFragment();

    for (const card of cards) {
      const item = createCardItem(card, {
        onStart: this.dependencies.onCardStart,
        onToggle: this.dependencies.onCardToggle,
      });
      fragment.appendChild(item);
    }

    this.container.appendChild(fragment);

    // Restore focus
    if (activeId) {
      requestAnimationFrame(() => {
        const element = document.getElementById(activeId);
        if (element) {
          console.log('[CardList] Restoring focus to:', activeId);
          element.focus();
        }
      });
    }
  }
}
