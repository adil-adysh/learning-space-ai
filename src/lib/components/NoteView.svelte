<script lang="ts">
import type { Note } from "../../types";
import { modalStore } from "../stores/modalStore";
import MoreMenu from "./MoreMenu.svelte";
import NoteEditorModal from "./NoteEditorModal.svelte";

// Mark markup-only component references as used so Biome doesn't flag them as unused
void MoreMenu;

type NoteApi = { deleteNote: (id: string) => Promise<void> };

interface Props {
	note: Note | null;
	cardId: string;
	api: NoteApi | null;
}

const props = $props() as Props;

let cardId = $state(props.cardId);
let note = $state(props.note);
let api = props.api;

$effect(() => {
	cardId = props.cardId;
	note = props.note;
	api = props.api;
});

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
	if (!resolved || !note) return;
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
      <button type="button" class="close" onclick={_close} aria-label="Close">✕</button>
    </header>

    <div class="meta">{note?.tags?.map((t:string) => `#${t}`).join(' ')}</div>

    <article class="body">
      <!-- render plain content to avoid Markdown rendering timing issues in tests -->
      <div class="raw-content">{note?.content}</div>
    </article>

    <footer>
      <MoreMenu ariaLabel={`More actions for note ${note?.title || 'note'}`} on:edit={_edit} on:delete={_remove} />
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
