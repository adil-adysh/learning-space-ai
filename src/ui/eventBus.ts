/**
 * Event Bus - Centralized event emitter for decoupled component communication
 * Uses TypeScript's type system for type-safe event handling
 */

export interface AppEvents {
  'form:open': void;
  'form:close': void;
  'form:submit': { title: string; topic: string; prompt: string };
  'form:success': { title: string };
  'form:error': { message: string };
  'card:added': void;
  'card:toggled': { id: string; status: 'todo' | 'done' };
  'list:updated': void;
}

type EventListener<K extends keyof AppEvents> = (data: AppEvents[K]) => void;

export class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Subscribe to an event
   */
  on<K extends keyof AppEvents>(event: K, listener: EventListener<K>): () => void {
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }

    this.listeners.get(event as string)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event as string)?.delete(listener);
    };
  }

  /**
   * Emit an event
   */
  emit<K extends keyof AppEvents>(event: K, data?: AppEvents[K]): void {
    const eventListeners = this.listeners.get(event as string);
    if (!eventListeners) return;

    for (const listener of eventListeners) {
      try {
        (listener as Function)(data);
      } catch (err) {
        console.error(`[EventBus] Error in listener for "${String(event)}":`, err);
      }
    }
  }

  /**
   * Subscribe to event once
   */
  once<K extends keyof AppEvents>(event: K, listener: EventListener<K>): () => void {
    const unsubscribe = this.on(event, ((data: AppEvents[K]) => {
      listener(data);
      unsubscribe();
    }) as EventListener<K>);

    return unsubscribe;
  }

  /**
   * Remove all listeners for an event or all events
   */
  off(event?: keyof AppEvents): void {
    if (event) {
      this.listeners.delete(event as string);
    } else {
      this.listeners.clear();
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();
