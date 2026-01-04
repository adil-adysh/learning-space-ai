import { createCardItem } from './cardItem';
import { AddForm } from './addFormComponent';
import { CardList } from './cardListComponent';
import { appState } from './appState';
import { eventBus } from './eventBus';
import { LearningCard } from '../types';

/**
 * Application Bootstrap
 * Initializes all services and components with proper dependency injection
 */
export async function init() {
  console.log('[Init] Starting application initialization');

  try {
    // ============================================================
    // 1. LOAD INITIAL DATA
    // ============================================================
    console.log('[Init] Loading initial data from API');
    appState.setLoading(true);

    const rawCards = await window.api.getCards();
    const cards: LearningCard[] = rawCards.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    appState.setCards(cards);
    appState.setLoading(false);

    console.log(`[Init] Loaded ${cards.length} cards from API`);

    // ============================================================
    // 2. INITIALIZE CARD LIST COMPONENT
    // ============================================================
    console.log('[Init] Initializing CardList component');

    const cardList = new CardList({
      onCardStart: handleCardStart,
      onCardToggle: handleCardToggle,
    });

    // Render initial list
    cardList.render();
    console.log('[Init] CardList component ready');

    // ============================================================
    // 3. INITIALIZE ADD FORM COMPONENT
    // ============================================================
    console.log('[Init] Initializing AddForm component');

    const addForm = new AddForm({
      onSubmit: handleFormSubmit,
    });

    console.log('[Init] AddForm component ready');

    // ============================================================
    // 4. SETUP EVENT HANDLERS
    // ============================================================
    console.log('[Init] Setting up event handlers');

    /**
     * Handle card "start learning" action
     */
    async function handleCardStart(card: LearningCard): Promise<void> {
      console.log('[Init.handleCardStart] Starting learning for card:', card.title);
      try {
        await window.api.runPrompt(card.prompt);
      } catch (err) {
        console.error('[Init.handleCardStart] Error:', err);
        eventBus.emit('form:error', { message: `Error starting ${card.title}` });
      }
    }

    /**
     * Handle card status toggle (completed/not completed)
     */
    async function handleCardToggle(card: LearningCard): Promise<void> {
      const newStatus: LearningCard['status'] = card.status === 'done' ? 'todo' : 'done';
      console.log(`[Init.handleCardToggle] Toggling card ${card.id} to "${newStatus}"`);

      try {
        await window.api.toggleCard(card.id, newStatus);
        appState.updateCardStatus(card.id, newStatus);
        
        const statusText = newStatus === 'done' ? 'completed' : 'not completed';
        const announcement = `${card.title} marked ${statusText}`;
        eventBus.emit('card:toggled', { id: card.id, status: newStatus });
        
        const sr = document.querySelector('#sr-announcements');
        if (sr) sr.textContent = announcement;
      } catch (err) {
        console.error('[Init.handleCardToggle] Error:', err);
        eventBus.emit('form:error', { message: `Error updating ${card.title}` });
      }
    }

    /**
     * Handle form submission (add new card)
     */
    async function handleFormSubmit(data: { title: string; topic: string; prompt: string }): Promise<void> {
      console.log('[Init.handleFormSubmit] Submitting new card:', data.title);

      try {
        const newCard = await window.api.addCard(data);
        appState.addCard(newCard);

        // Focus first card's button after adding
        requestAnimationFrame(() => {
          const firstCardBtn = document.querySelector('#cards button.primary') as HTMLButtonElement | null;
          firstCardBtn?.focus();
        });
      } catch (err) {
        console.error('[Init.handleFormSubmit] Error:', err);
        throw err;
      }
    }

    // ============================================================
    // 5. SETUP DIAGNOSTICS TOGGLE
    // ============================================================
    const diagToggle = document.querySelector('#diag-toggle') as HTMLButtonElement | null;
    if (diagToggle) {
      console.log('[Init] Setting up diagnostics toggle');
      
      diagToggle.addEventListener('click', async () => {
        const isPressed = diagToggle.getAttribute('aria-pressed') === 'true';
        const newState = !isPressed;
        diagToggle.setAttribute('aria-pressed', newState.toString());

        try {
          const { setEnabled, log } = await import('./logger');
          setEnabled(newState);
          log('UI', 'diag-toggle', { enabled: newState });
        } catch (e) {
          console.log('[Init] Diagnostics module not available');
        }
      });
    }

    console.log('[Init] Application initialization complete');
    return { addForm, cardList };
  } catch (err) {
    console.error('[Init] Critical initialization error:', err);
    throw err;
  }
}