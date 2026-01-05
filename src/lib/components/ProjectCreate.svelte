<script lang="ts">
  import { projectManager } from '../projectManager.svelte';

  interface Props {
    oncreated?: (detail: { project: string }) => void;
  }

  type FormValues = { name: string; systemPrompt: string };

  const { oncreated }: Props = $props();

  // Form state using Svelte 5 runes
  let formData: FormValues = $state({ name: '', systemPrompt: '' });
  let submissionError: string | null = $state(null);
  let isSubmitting = $state(false);
  let fieldErrors = $state<{ name?: string; systemPrompt?: string }>({});

  // Derived computed values for accessibility
  let descriptionIds = $derived(
    fieldErrors.name ? 'name-error project-hint' : 'project-hint'
  );

  // Validation function
  function validateForm(values: FormValues): { name?: string; systemPrompt?: string } {
    const errors: { name?: string; systemPrompt?: string } = {};
    if (!values.name || values.name.trim() === '') {
      errors.name = 'Project name is required';
    }
    if (values.systemPrompt && values.systemPrompt.length > 8000) {
      errors.systemPrompt = 'System prompt must be less than 8000 characters';
    }
    return errors;
  }

  // Handle form submission
  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    fieldErrors = validateForm(formData);
    if (Object.keys(fieldErrors).length > 0) return;

    submissionError = null;
    isSubmitting = true;

    try {
      const trimmedName = formData.name.trim();
      const trimmedSystemPrompt = formData.systemPrompt.trim() || undefined;
      const created = await projectManager.createProject(trimmedName, trimmedSystemPrompt);

      // Reset form
      formData = { name: '', systemPrompt: '' };
      fieldErrors = {};

      // Emit event via callback
      oncreated?.({ project: created.id });
    } catch (error) {
      console.error('Failed to create project', error);
      submissionError =
        error instanceof Error ? error.message :
        'Unable to create project right now. Try again in a moment.';
    } finally {
      isSubmitting = false;
    }
  }

  function cancel() {
    formData = { name: '', systemPrompt: '' };
    fieldErrors = {};
    submissionError = null;
    projectManager.selectProject('all');
  }
</script>

<section class="project-create">
  <h2>Create project</h2>
  <form onsubmit={handleSubmit} aria-describedby={descriptionIds} class="project-form">
    <label for="proj-name">Project name</label>
    <input
      id="proj-name"
      bind:value={formData.name}
      type="text"
      placeholder="e.g. JavaScript"
      aria-invalid={fieldErrors.name ? 'true' : 'false'}
      class:error={fieldErrors.name}
      disabled={isSubmitting}
    />
    {#if fieldErrors.name}
      <p id="name-error" class="field-error" role="alert">
        {fieldErrors.name}
      </p>
    {/if}
    <p class="hint" id="project-hint">The project name appears in the sidebar list.</p>
    
    <label for="proj-system-prompt">System prompt <span class="optional">(optional)</span></label>
    <textarea
      id="proj-system-prompt"
      bind:value={formData.systemPrompt}
      placeholder="e.g. You are an expert JavaScript developer. Always provide code examples and explain best practices."
      aria-invalid={fieldErrors.systemPrompt ? 'true' : 'false'}
      class:error={fieldErrors.systemPrompt}
      disabled={isSubmitting}
      rows="4"
    ></textarea>
    {#if fieldErrors.systemPrompt}
      <p id="system-prompt-error" class="field-error" role="alert">
        {fieldErrors.systemPrompt}
      </p>
    {/if}
    <p class="hint" id="system-prompt-hint">This prompt will be prepended to all learning cards in this project when sent to ChatGPT.</p>
    
    {#if submissionError}
      <p class="submission-error" role="alert">{submissionError}</p>
    {/if}
    <div class="actions">
      <button type="submit" class="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create project'}
      </button>
      <button type="button" class="ghost" onclick={cancel} disabled={isSubmitting}>
        Cancel
      </button>
    </div>
  </form>
</section>

<style>
  .project-create {
    padding: 1.5rem;
    max-width: 520px;
    background: var(--surface, #ffffff);
    border-radius: 14px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
  }

  h2 {
    margin: 0 0 1rem;
    font-size: 1.35rem;
    letter-spacing: 0.02em;
  }

  .project-form {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  label {
    font-weight: 600;
    font-size: 0.95rem;
  }

  input {
    padding: 0.75rem 0.85rem;
    border-radius: 10px;
    border: 1px solid #d0d7de;
    font-size: 1rem;
    font-family: inherit;
  }

  input.error {
    border-color: #d10c2a;
    box-shadow: inset 0 0 0 1px rgba(209, 12, 42, 0.2);
  }

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: #5f6c7b;
  }

  .field-error,
  .submission-error {
    margin: 0;
    font-size: 0.85rem;
    color: #d10c2a;
  }

  .actions {
    margin-top: 1.25rem;
    display: flex;
    gap: 0.75rem;
  }

  button {
    border: none;
    border-radius: 8px;
    padding: 0.65rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  button.primary {
    background: #1f7ae0;
    color: #fff;
    box-shadow: 0 10px 20px rgba(31, 122, 224, 0.25);
  }

  button.primary:not(:disabled):active {
    transform: translateY(1px);
  }

  button.ghost {
    background: transparent;
    border: 1px solid #1f7ae0;
    color: #1f7ae0;
  }

  button.ghost:not(:disabled):hover {
    background: rgba(31, 122, 224, 0.08);
  }

  @media (max-width: 600px) {
    .project-create {
      padding: 1.25rem;
    }

    .actions {
      flex-direction: column;
    }

    button {
      width: 100%;
    }
  }
</style>
