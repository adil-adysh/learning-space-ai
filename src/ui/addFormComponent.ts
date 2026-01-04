/**
 * AddForm Component - Class-based with dependency injection
 * Handles form creation, submission, and state management
 * Uses event bus for decoupled communication
 */

import { qs, srAnnounce } from './utils';
import { eventBus } from './eventBus';
import { appState } from './appState';

export interface AddFormDependencies {
  onSubmit: (data: { title: string; topic: string; prompt: string }) => Promise<void>;
}

export class AddForm {
  private toggle: HTMLButtonElement | null;
  private form: HTMLFormElement | null;
  private cancel: HTMLButtonElement | null;
  private submitBtn: HTMLButtonElement | null;
  private titleInput: HTMLInputElement | null;
  private topicInput: HTMLInputElement | null;
  private promptTextarea: HTMLTextAreaElement | null;
  private statusDiv: HTMLDivElement | null;
  private isSaving = false;

  constructor(private dependencies: AddFormDependencies) {
    this.toggle = qs<HTMLButtonElement>('#toggle-add');
    this.form = qs<HTMLFormElement>('#add-form');
    this.cancel = qs<HTMLButtonElement>('#cancel-add');
    this.submitBtn = this.form?.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.titleInput = qs<HTMLInputElement>('#title');
    this.topicInput = qs<HTMLInputElement>('#topic');
    this.promptTextarea = qs<HTMLTextAreaElement>('#prompt');
    this.statusDiv = qs<HTMLDivElement>('#add-status');

    // Validate all required elements exist
    this.validateElements();

    // Attach event listeners
    this.attachListeners();

    // Subscribe to app events
    this.subscribeToEvents();

    console.log('[AddForm] Component initialized');
  }

  /**
   * Validate that all required DOM elements exist
   */
  private validateElements(): void {
    const missing: string[] = [];

    if (!this.toggle) missing.push('toggle');
    if (!this.form) missing.push('form');
    if (!this.cancel) missing.push('cancel');
    if (!this.titleInput) missing.push('titleInput');
    if (!this.topicInput) missing.push('topicInput');
    if (!this.promptTextarea) missing.push('promptTextarea');
    if (!this.statusDiv) missing.push('statusDiv');

    if (missing.length > 0) {
      const msg = `AddForm: Missing required elements: ${missing.join(', ')}`;
      console.error('[AddForm]', msg);
      throw new Error(msg);
    }
  }

  /**
   * Attach DOM event listeners
   */
  private attachListeners(): void {
    // Toggle button click
    this.toggle!.addEventListener('click', () => {
      console.log('[AddForm] Toggle button clicked');
      const isOpen = appState.getValue('isFormOpen');
      isOpen ? this.hide() : this.show();
    });

    // Cancel button click
    this.cancel!.addEventListener('click', () => {
      console.log('[AddForm] Cancel button clicked');
      this.clearForm();
      this.clearStatus();
      this.hide();
      this.toggle!.focus();
    });

    // Form submission
    this.form!.addEventListener('submit', (e) => this.handleSubmit(e));

    // Escape key to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && appState.getValue('isFormOpen')) {
        console.log('[AddForm] Escape key pressed, closing form');
        this.hide();
      }
    });
  }

  /**
   * Subscribe to app events
   */
  private subscribeToEvents(): void {
    eventBus.on('form:open', () => {
      console.log('[AddForm] Event: form:open received');
    });

    eventBus.on('form:close', () => {
      console.log('[AddForm] Event: form:close received');
    });

    eventBus.on('form:error', ({ message }) => {
      console.error('[AddForm] Event: form:error -', message);
    });

    eventBus.on('form:success', ({ title }) => {
      console.log('[AddForm] Event: form:success -', title);
    });
  }

  /**
   * Show the form
   */
  private show(): void {
    console.log('[AddForm] show() called');
    if (!this.form) return;

    this.form.hidden = false;
    this.toggle!.setAttribute('aria-expanded', 'true');
    this.clearStatus();
    appState.setFormOpen(true);
    this.titleInput!.focus();

    console.log('[AddForm] Form is now visible, form.hidden =', this.form.hidden);
  }

  /**
   * Hide the form
   */
  private hide(): void {
    console.log('[AddForm] hide() called');
    if (!this.form) return;

    this.form.hidden = true;
    this.toggle!.setAttribute('aria-expanded', 'false');
    appState.setFormOpen(false);

    console.log('[AddForm] Form is now hidden, form.hidden =', this.form.hidden);
  }

  /**
   * Show status message
   */
  private showStatus(message: string, type: 'error' | 'success' = 'error'): void {
    if (!this.statusDiv) return;

    this.statusDiv.textContent = message;
    this.statusDiv.className = type === 'success' ? 'form-status success' : 'form-status';
    srAnnounce(message);

    console.log(`[AddForm] Status message (${type}): ${message}`);
  }

  /**
   * Clear status message
   */
  private clearStatus(): void {
    if (!this.statusDiv) return;

    this.statusDiv.textContent = '';
    this.statusDiv.className = 'form-status';
  }

  /**
   * Clear form fields
   */
  private clearForm(): void {
    this.titleInput!.value = '';
    this.topicInput!.value = '';
    this.promptTextarea!.value = '';
    this.form!.reset();
  }

  /**
   * Handle form submission
   */
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (this.isSaving) {
      console.warn('[AddForm] Submission already in progress, ignoring');
      return;
    }

    const title = this.titleInput!.value.trim();
    const topic = this.topicInput!.value.trim();
    const prompt = this.promptTextarea!.value.trim();

    // Validation
    if (!title || !prompt) {
      const msg = 'Please provide both a title and a prompt.';
      this.showStatus(msg, 'error');
      srAnnounce(msg);

      if (!title) {
        this.titleInput!.focus();
      } else if (!prompt) {
        this.promptTextarea!.focus();
      }

      console.warn('[AddForm] Validation failed:', { title: !!title, prompt: !!prompt });
      return;
    }

    // Submit
    try {
      this.isSaving = true;
      this.submitBtn!.disabled = true;
      this.submitBtn!.textContent = 'Saving...';

      console.log('[AddForm] Submitting form with data:', { title, topic, prompt });

      await this.dependencies.onSubmit({ title, topic, prompt });

      eventBus.emit('form:success', { title });
      this.showStatus(`Success: Added "${title}"`, 'success');
      srAnnounce(`Success: Added ${title}`);
      this.clearForm();

      // Delay to let user see success
      setTimeout(() => {
        this.hide();
        this.toggle!.focus();
      }, 800);
    } catch (err) {
      const errorMsg = 'Failed to save card. Please try again.';
      console.error('[AddForm] Submission error:', err);
      eventBus.emit('form:error', { message: errorMsg });
      this.showStatus(errorMsg, 'error');
    } finally {
      this.isSaving = false;
      this.submitBtn!.disabled = false;
      this.submitBtn!.textContent = 'Save card';
    }
  }
}
