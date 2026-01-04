<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { createForm } from 'felte';
  import type { FormErrors } from 'felte';
  import { projectManager } from '../projectManager.svelte';

  type FormValues = { name: string };

  const dispatch = createEventDispatcher<{ created: { project: string } }>();
  let submissionError: string | null = null;
  let descriptionIds = 'project-hint';

  const { form, errors, isSubmitting, reset } = createForm<FormValues>({
    initialValues: { name: '' },
    validate: (values) => {
      const validation: FormErrors<FormValues> = {};
      if (!values.name || values.name.trim() === '') {
        validation.name = 'Project name is required';
      }
      return validation;
    },
    onSubmit: async (values) => {
      submissionError = null;
      const trimmed = values.name?.trim();
      if (!trimmed) return;

      try {
        const created = await projectManager.createProject(trimmed);
        dispatch('created', { project: created.id });
        reset();
      } catch (error: any) {
        console.error('Failed to create project', error);
        // Show the actual error message from the backend
        submissionError = error?.message || 'Unable to create project right now. Try again in a moment.';
      }
    },
  });

  $: descriptionIds = $errors?.name ? 'name-error project-hint' : 'project-hint';

  function cancel() {
    reset();
    projectManager.selectProject('all');
  }
</script>

<section class="project-create">
  <h2>Create project</h2>
  <form use:form aria-describedby={descriptionIds} class="project-form">
    <label for="proj-name">Project name</label>
    <input
      id="proj-name"
      name="name"
      type="text"
      placeholder="e.g. JavaScript"
      aria-invalid={$errors?.name ? 'true' : 'false'}
      class:error={$errors?.name}
    />
    {#if $errors?.name}
      <p id="name-error" class="field-error" role="alert">
        {$errors.name}
      </p>
    {/if}
    <p class="hint" id="project-hint">The project name appears in the sidebar list.</p>
    {#if submissionError}
      <p class="submission-error" role="alert">{submissionError}</p>
    {/if}
    <div class="actions">
      <button type="submit" class="primary" disabled={$isSubmitting}>
        {$isSubmitting ? 'Creating...' : 'Create project'}
      </button>
      <button type="button" class="ghost" onclick={cancel} disabled={$isSubmitting}>
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
