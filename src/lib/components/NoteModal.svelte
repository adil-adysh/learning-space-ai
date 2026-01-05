<script lang="ts">
  import { onMount } from 'svelte';
  import NoteEditorModal from './NoteEditorModal.svelte';
  import type { Note } from '../../types';

  export let open = false;
  export let cardId: string;
  export let cardTitle: string | undefined;

  let notes: Note[] = [];
  let editorOpen = false;
  let editing: Note | null = null;

  async function load() {
    if (!cardId) return;
    notes = await window.api.getNotes(cardId);
  }

  $: if (open) {
    load();
  }

  function openNew() {
    editing = null;
    editorOpen = true;
  }

  function editNote(n: Note) {
    editing = n;
    editorOpen = true;
  }

  async function handleSave(e: CustomEvent) {
    const payload = e.detail;
    if (payload.id) {
      await window.api.updateNote({ id: payload.id, title: payload.title, content: payload.content, tags: payload.tags });
    } else {
      await window.api.createNote({ cardId, title: payload.title, content: payload.content, tags: payload.tags });
    }
    editorOpen = false;
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return;
    await window.api.deleteNote(id);
    await load();
  }

  function close() {
    open = false;
  }
</script>

{#if open}
  <div class="notes-modal-backdrop" role="dialog" aria-modal="true" tabindex="-1">
    <div class="notes-modal">
      <header>
        <h3>Notes for {cardTitle || 'Card'}</h3>
        <button type="button" class="close" on:click={close}>✕</button>
      </header>

      <div class="notes-list">
        {#if notes.length === 0}
          <div class="empty">No notes yet. Click "New Note" to add one.</div>
        {:else}
          {#each notes as n}
            <article class="note-item">
              <h4>{n.title || '(untitled)'}</h4>
              <div class="meta">{n.tags?.map(t => `#${t}`).join(' ')}</div>
              <pre class="content">{n.content}</pre>
              <div class="actions">
                <button type="button" on:click={() => editNote(n)}>Edit</button>
                <button type="button" class="danger" on:click={() => handleDelete(n.id)}>Delete</button>
              </div>
            </article>
          {/each}
        {/if}
      </div>

      <footer>
        <button type="button" class="primary" on:click={openNew}>New Note</button>
      </footer>
    </div>
  </div>

  <NoteEditorModal open={editorOpen} note={editing} cardId={cardId} on:save={handleSave} on:cancel={() => (editorOpen = false)} />
{/if}

<style>
  .notes-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:60; }
  .notes-modal { width: min(860px, 96%); max-height: 90vh; overflow:auto; background: var(--surface,#fff); border-radius:8px; padding:1rem; }
  header { display:flex; justify-content:space-between; align-items:center; }
  .notes-list { margin-top: 0.75rem; }
  .note-item { border:1px solid rgba(0,0,0,0.05); padding:0.5rem; border-radius:6px; margin-bottom:0.5rem; }
  .note-item .meta { color: var(--muted,#666); font-size:0.85rem; }
  .note-item .content { white-space:pre-wrap; margin:0.5rem 0; }
  .actions { display:flex; gap:0.5rem; }
  .primary { background:#2563eb; color:#fff; border:none; padding:0.5rem 0.75rem; border-radius:6px }
  .danger { color:#b91c1c; background:transparent; border:1px solid rgba(0,0,0,0.06); padding:0.25rem 0.5rem; border-radius:6px }
  .close { background:transparent; border:none; font-size:1.1rem }
</style>
