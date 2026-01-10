<script lang="ts">
import type { Note } from "../../types";
import { modalStore } from "../stores/modalStore";

/* biome-disable lint/style/useConst */
// Svelte DOM refs (bind:this) are mutated by the template; keep `let` declarations
/* biome-enable lint/style/useConst */

export const note: Note | null = null; // null => create new
export const cardId: string | null = null;
type NoteApi = {
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
};

export const api: NoteApi | null = null;
export const onSaved: ((note: Note) => void) | null = null; // optional callback for parent to react to saved note (create/update)

let title = $state("");
let content = $state("");
let tagsText = $state("");
// bound via `bind:this` in template — must remain `let` for Svelte
/* biome-disable-next-line lint/style/useConst */
let _firstInput: HTMLInputElement | null = $state(null); // bound via bind:this in template

$effect(() => {
	// populate from note
	title = note?.title || "";
	content = note?.content || "";
	tagsText = (note?.tags || []).join(", ");
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

async function _doSave() {
	const tags = tagsText
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);

	const resolved = resolveApi();
	if (!resolved) return;

	if (note?.id) {
		const updated = await resolved.updateNote({
			id: note.id,
			title,
			content,
			tags,
		});
		// notify parent directly via callback if provided; keep global event for backward compat
		if (typeof onSaved === "function") {
			onSaved(updated);
		}
		window.dispatchEvent(
			new CustomEvent("notes:changed", {
				detail: { cardId, noteId: updated.id },
			}),
		);
	} else {
			const created = await resolved.createNote({
			cardId: cardId ?? (undefined as unknown as string),
			title,
			content,
			tags,
		});
		// notify parent directly via callback if provided (preferred), and keep global event for backward compat
		if (typeof onSaved === "function") {
			onSaved(created);
		}
		window.dispatchEvent(
			new CustomEvent("notes:changed", {
				detail: { cardId, noteId: created.id },
			}),
		);
	}

	// close editor
	modalStore.pop();
}

function cancel() {
	modalStore.pop();
}

function _onKey(e: KeyboardEvent) {
	if (e.key === "Escape") {
		e.stopPropagation();
		cancel();
	}
}
</script>

  <div class="modal-backdrop" role="dialog" aria-modal="true" tabindex="-1" onkeydown={_onKey}>
    <div class="modal" role="document">
      <header>
        <h2>{note ? 'Edit Note' : 'New Note'}</h2>
      </header>

      <div class="body">
        <label>
          Title
          <input bind:this={_firstInput} bind:value={title} />
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
        <button type="button" class="secondary" onclick={cancel}>Cancel</button>
        <button type="button" class="primary" onclick={_doSave}>Save</button>
      </footer>
    </div>
  </div>

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
