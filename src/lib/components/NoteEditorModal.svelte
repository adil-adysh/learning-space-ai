<script lang="ts">
  import { onMount } from 'svelte';
  import type { Note } from '../../types';

  export let open = false;
  export let note: Note | null = null; // null => create new
  export let cardId: string | null = null;

  // Events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let title = '';
  let content = '';
  let tagsText = '';
  let firstInput: HTMLInputElement | null = null;
  let previouslyFocused: Element | null = null;

  $: if (open) {
    // populate from note
    title = note?.title || '';
    content = note?.content || '';
    tagsText = (note?.tags || []).join(', ');
  }

  onMount(() => {
    // nothing here
  });

  function onOpen() {
    previouslyFocused = document.activeElement as Element | null;
    requestAnimationFrame(() => firstInput?.focus());
  }

  function close() {
    dispatch('cancel');
  }

  function save() {
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (note) {
      dispatch('save', { id: note.id, title, content, tags });
    } else if (cardId) {
      dispatch('save', { cardId, title, content, tags });
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  }
</script>

{#if open}
  <div class="modal-backdrop" role="dialog" aria-modal="true" tabindex="-1" on:keydown={onKey} on:introstart={onOpen}>
    <div class="modal" role="document">
      <header>
        <h2>{note ? 'Edit Note' : 'New Note'}</h2>
      </header>

      <div class="body">
        <label>
          Title
          <input bind:this={firstInput} bind:value={title} />
        </label>

        <label>
          Content
          <textarea bind:value={content} rows={8}></textarea>
        </label>

        <label>
          Tags (comma separated)
          <input bind:value={tagsText} />
        </label>
      </div>

      <footer>
        <button type="button" class="secondary" on:click={close}>Cancel</button>
        <button type="button" class="primary" on:click={save}>Save</button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.4);
    z-index: 60;
  }
  .modal {
    background: var(--surface, #fff);
    border-radius: 8px;
    padding: 1rem;
    width: min(720px, 96%);
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }
  .modal header h2 { margin: 0 0 0.5rem 0; }
  .body label { display: block; margin-bottom: 0.75rem; }
  input, textarea { width: 100%; padding: 0.5rem; border: 1px solid rgba(0,0,0,0.08); border-radius: 6px; }
  footer { display:flex; gap:0.5rem; justify-content: flex-end; margin-top: 0.75rem; }
  .primary { background: #2563eb; color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 6px; }
  .secondary { background: transparent; border: 1px solid rgba(0,0,0,0.08); padding: 0.5rem 0.75rem; border-radius: 6px; }
</style>
