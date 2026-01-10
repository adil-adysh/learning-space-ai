<script lang="ts">
import type { LearningCard, Note } from "../../types";
import { projectManager } from "../projectManager.svelte";
import MoreMenu from "./MoreMenu.svelte";
import NoteModal from "./NoteModal.svelte";
import { modalStore } from "../stores/modalStore";

/* biome-disable lint/style/useConst */
// Svelte DOM refs (bind:this) are mutated by the template; keep `let` declarations
/* biome-enable lint/style/useConst */

interface Props {
	card: LearningCard;
	onStart: (card: LearningCard) => void;
	onToggle: (id: string, status: "active" | "done") => void;
	onEdit?: (card: LearningCard) => void;
	onDelete?: (id: string) => void;
	noteApi?: {
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
}

const props = $props() as Props;
let card: LearningCard = $state(props.card);
let onStart = props.onStart;
let onToggle = props.onToggle;
let onEdit = props.onEdit;
let onDelete = props.onDelete;
let noteApi = props.noteApi;

$effect(() => {
	card = props.card;
	onStart = props.onStart;
	onToggle = props.onToggle;
	onEdit = props.onEdit;
	onDelete = props.onDelete;
	noteApi = props.noteApi;
});
// Mark props used (some analyzers miss template usage)
void onStart;
void onToggle;
void onEdit;
void onDelete;
void noteApi;

// Derived computed values
const isDone = $derived.by(() => card.status === "done");
const buttonLabel = $derived.by(() =>
	card.status === "done" ? "Mark active" : "Mark done",
);
const statusText = $derived.by(() =>
	card.status === "done" ? "✓ Completed" : "Active",
);
const projectName = $derived.by(() => {
	if (!card.project) return "";
	return (
		projectManager.all.find((p) => p.id === card.project)?.name || card.project
	);
});
// Mirror derived values into stateful aliases to avoid "reference only captures the initial value" warnings
let _buttonLabel = $state("");
let _statusText = $state("");
let _projectName = $state("");
$effect(() => {
	_buttonLabel = buttonLabel;
	_statusText = statusText;
	_projectName = projectName;
});

// local modal state (Svelte 5 rune) - replaced by centralized modalStore
const _notesOpen = $state(false); // intentionally unused; kept for possible future local state
// ensure component imports are treated as used by linter
void MoreMenu;
void NoteModal;
void modalStore;
</script>

<article class="card" class:done={isDone}>
	<header>
		<h3>{card.title}</h3>
		{#if card.topic}
			<p class="topic">{card.topic}</p>
		{/if}
		{#if card.project}
			<p class="project">Project: <strong>{_projectName}</strong></p>
		{/if}
	</header>

	<section>
		<div class="status" class:done={isDone}>{_statusText}</div>
		<pre class="prompt">{card.prompt}</pre>
	</section>

	<footer class="card-actions">
		<button
			type="button"
			class="primary"
			onclick={(e) => { e.stopPropagation(); onStart(card); }}
			aria-label={`Start chat with prompt for ${card.title}`}
		>
			Start in ChatGPT
		</button>

		<label class="check">
			<input
				type="checkbox"
					checked={isDone}
					onclick={(e) => { e.stopPropagation(); onToggle(card.id, isDone ? 'active' : 'done'); }}
					aria-label={isDone ? `Mark ${card.title} as active` : `Mark ${card.title} as done`}
				/>
				<span class="check-label">{_buttonLabel}</span>
			</label>
			<button
				type="button"
				class="secondary open-notes"
				onclick={(e) => {
					e.stopPropagation();
					modalStore.open(NoteModal, { cardId: card.id, cardTitle: card.title, api: noteApi });
				}}
				aria-label={`Open notes for ${card.title}`}
			>
				Open Notes
			</button>

		<MoreMenu ariaLabel={`More actions for ${card.title}`} on:edit={() => onEdit?.(card)} on:delete={() => onDelete?.(card.id)} />
	</footer>
</article>

<!-- Modal is now rendered by ModalContainer via modalStore -->


<style>
	.card {
		margin-bottom: 1rem;
	}

	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.check input[type='checkbox'] {
		width: 1.1rem;
		height: 1.1rem;
	}

	.check-label {
		font-size: 0.9rem;
		color: var(--muted, #666);
	}

	.done {
		opacity: 0.7;
	}

	/* moved danger styles to MoreMenu where Delete lives */
</style>
