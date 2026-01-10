<script lang="ts">
import type { Note } from "../../types";
import { modalStore } from "../stores/modalStore";
import NoteEditorModal from "./NoteEditorModal.svelte";

type NoteApi = { deleteNote: (id: string) => Promise<void> };

export const note: Note | null = null;
export const cardId: string | null = null;
export const api: NoteApi | null = null;

function resolveApi(): NoteApi | null {
	if (api) return api;
	if (
		typeof window !== "undefined" &&
		(window as unknown as { api?: NoteApi }).api
	)
		return (window as unknown as { api?: NoteApi }).api;
	return null;
}

function _close() {
	modalStore.pop();
}

function _edit() {
	const resolved = resolveApi();
	modalStore.push(NoteEditorModal, { cardId, note, api: resolved });
}

async function _remove() {
	const resolved = resolveApi();
	if (!resolved) return;
	if (!confirm("Delete this note?")) return;
	await resolved.deleteNote(note.id);
	window.dispatchEvent(
		new CustomEvent("notes:changed", { detail: { cardId } }),
	);
	modalStore.pop();
}
</script>

<div class="note-view-backdrop" role="dialog" aria-modal="true" tabindex="-1">
  <div class="note-view" role="document">
    <header>
      <h2>{note?.title || 'Note'}</h2>
      <button type="button" class="close" onclick={close} aria-label="Close">✕</button>
    </header>

    <div class="meta">{note?.tags?.map((t:string) => `#${t}`).join(' ')}</div>

    <article class="body">
      <NoteContent markdown={note?.content || ''} />
    </article>

    <footer>
      <MoreMenu ariaLabel={`More actions for note ${note?.title || 'note'}`} on:edit={edit} on:delete={remove} />
    </footer>
  </div>
</div>

<style>
  .note-view-backdrop { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.4); z-index: 70; }
  .note-view { width: min(860px, 96%); max-height: 90vh; overflow:auto; background: var(--surface,#fff); border-radius:8px; padding:1rem; }
  header { display:flex; justify-content:space-between; align-items:center; }
  .meta { color: var(--muted,#666); font-size:0.9rem; margin-bottom:0.5rem }
  .body { margin-top: 0.5rem }
  footer { display:flex; gap:0.5rem; justify-content:flex-end; margin-top:0.75rem }
  .close { background:transparent; border:none }
</style>
