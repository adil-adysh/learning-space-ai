<script lang="ts">
/* global setTimeout */

import { createEventDispatcher, onDestroy, onMount } from "svelte";
import type { Note } from "../../types";
import { modalStore } from "../stores/modalStore";
import MoreMenu from "./MoreMenu.svelte";
import NoteContent from "./NoteContent.svelte";
import NoteEditorModal from "./NoteEditorModal.svelte";
import NoteView from "./NoteView.svelte";

/* biome-disable lint/style/useConst */
// Svelte DOM refs (bind:this) are mutated by the template; keep `let` declarations
/* biome-enable lint/style/useConst */

interface Props {
	cardId: string;
	cardTitle?: string;
	api?: {
		getNotes(cardId: string): Promise<Note[]>;
		createNote(payload: {
			cardId: string;
			title: string;
			content: string;
			tags: string[];
		}): Promise<Note>;
		updateNote(payload: {
			id: string;
			title?: string;
			content?: string;
			tags?: string[];
		}): Promise<Note>;
		deleteNote(id: string): Promise<Note>;
	} | null;
	confirmFn?: (message: string) => boolean;
}
const props = $props() as Props;
let cardId = $state(props.cardId);
let cardTitle = $state(props.cardTitle);
let api = props.api;
let confirmFn = props.confirmFn;
$effect(() => {
	cardId = props.cardId;
	cardTitle = props.cardTitle;
	api = props.api;
	confirmFn = props.confirmFn;
});
const dispatch = createEventDispatcher();

// referenced in template
void NoteContent;
void MoreMenu;

let notes: Note[] = $state([] as Note[]);
void notes; // used in template
const _editing: Note | null = $state(null);
// bound via `bind:this` in template — must remain `let` for Svelte
/* biome-disable-next-line lint/style/useConst */
let dialogRef: HTMLElement | null = $state(null);
let lastCreatedNoteId: string | null = $state(null);

// mark functions as used (template usage sometimes not detected by linter)
void openNew; void editNote; void openView; void handleDelete; void close;

function resolveApi() {
	if (api) return api;
	if (
		typeof window !== "undefined" &&
		(window as unknown as { api?: Props["api"] }).api
	)
		return (window as unknown as { api?: Props["api"] }).api;
	return null;
}

async function load() {
	if (!cardId) return;
	const resolved = resolveApi();
	if (!resolved) return;
	notes = await resolved.getNotes(cardId);
}

function openNew() {
	const resolved = resolveApi();
	// push the editor onto the modal stack so the list remains mounted underneath
	modalStore.push(NoteEditorModal, {
		cardId,
		note: null,
		api: resolved,
		onSaved: (created: Note) => {
			// focus the newly created note after reload
			lastCreatedNoteId = created.id;
			load().then(() => {
				if (lastCreatedNoteId) {
					const el = document.getElementById(`note-${lastCreatedNoteId}`) as HTMLElement | null;
					if (el && typeof el.focus === "function") {
						setTimeout(() => el.focus(), 0);
					}
					lastCreatedNoteId = null;
				}
			});
		}
	});
}

function editNote(n: Note) {
	const resolved = resolveApi();
	modalStore.push(NoteEditorModal, { cardId, note: n, api: resolved });
}

function openView(n: Note) {
	const resolved = resolveApi();
	modalStore.push(NoteView, { cardId, note: n, api: resolved });
}

// NoteEditor will perform saves itself and dispatch a global event when notes change.

async function handleDelete(id: string) {
	const resolvedConfirm =
		confirmFn ??
		(typeof window !== "undefined" ? window.confirm.bind(window) : () => true);
	if (!resolvedConfirm("Delete this note?")) return;
	const resolved = resolveApi();
	if (!resolved) return;
	await resolved.deleteNote(id);
	await load();
}

function close() {
	dispatch("close");
}

// listen for global note-change events so the list refreshes when the editor creates/updates
onMount(() => {
	load();
	setTimeout(() => dialogRef?.focus(), 0);
});
</script>

  <div class="notes-modal-backdrop" role="dialog" aria-modal="true" tabindex="-1" bind:this={dialogRef}>
    <div class="notes-modal">
      <header>
        <h3>Notes for {cardTitle || 'Card'}</h3>
        <button
          type="button"
          class="close"
          onclick={close}
          aria-label={"Close notes for " + (cardTitle || 'card')}
          title={"Close notes"}
        >
          ✕
        </button>
      </header>

      <div class="notes-list">
        {#if notes.length === 0}
          <div class="empty">No notes yet. Click "New Note" to add one.</div>
        {:else}
          <ul class="notes" role="list">
            {#each notes as n}
              <li>
                <div class="note-item">
                    <button id={"note-" + n.id} type="button" class="note-open" onclick={() => openView(n)} aria-label={`Open note ${n.title || 'untitled'}`}>
                    <h4>{n.title || '(untitled)'}</h4>
                    <div class="meta">{n.tags?.map(t => `#${t}`).join(' ')}</div>
                    <!-- render markdown content safely -->
                    <div class="content"><NoteContent markdown={n.content} /></div>
                  </button>
                  <div class="actions">
                    <MoreMenu ariaLabel={`More actions for note ${n.title || 'untitled'}`} on:edit={() => editNote(n)} on:delete={() => handleDelete(n.id)} />
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <footer>
        <button type="button" class="primary" onclick={openNew}>New Note</button>
      </footer>
    </div>
  </div>

  <!-- NoteEditorModal instances are pushed onto the modal stack so they're rendered by ModalContainer -->

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
  .close { background:transparent; border:none; font-size:1.1rem }
</style>
