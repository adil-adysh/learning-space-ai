<script lang="ts">
/* biome-disable lint/correctness/noUnusedImports -- used in markup/modal (Svelte component imports) */
import type { LearningCard } from "../../types";
import { cardManager } from "../cardManager.svelte";
import { projectManager } from "../projectManager.svelte";
import { modalStore } from "../stores/modalStore";
import AddForm from "./AddForm.svelte";
import CardList from "./CardList.svelte";
import EditCardForm from "./EditCardForm.svelte";
/* used in markup/modal */
void CardList;
void EditCardForm;

interface Props {
	projectId: string;
}

const { projectId }: Props = $props();

// Derived value: find current project
const _project = $derived.by(() => {
	if (!projectManager.all || !projectId) return undefined;
	return projectManager.all.find((p) => p.id === projectId);
});

// Effect: Ensure projects are loaded
$effect(() => {
	if (!projectManager.all || projectManager.all.length === 0) {
		projectManager.loadProjects();
	}
});

function _openAddForm() {
	modalStore.open(AddForm, {
		initialProject: projectId,
		onSubmit: async (data: {
			title: string;
			prompt: string;
			topic?: string;
			project?: string;
		}) => {
			await handleFormSubmit(data);
			modalStore.close();
		},
		onCancel: () => modalStore.close(),
	});
}

async function handleFormSubmit(data: {
	title: string;
	prompt: string;
	topic?: string;
	project?: string;
}) {
	const hasProject = data.project && String(data.project).trim().length > 0;
	const assignedProject = hasProject ? data.project : projectId || undefined;
	await cardManager.addCard({ ...data, project: assignedProject });
	cardManager.closeForm();
}

async function _handleStart(card: LearningCard) {
	// Get the project's system prompt if the card belongs to a project
	let systemPrompt: string | undefined;
	if (card.project) {
		const proj = projectManager.all.find((p) => p.id === card.project);
		systemPrompt = proj?.systemPrompt;
	}

	// Pass both the card prompt and system prompt
	await cardManager.runPromptWithSystem(card.prompt, systemPrompt);
}

async function _handleCardToggle(id: string, status: "active" | "done") {
	await cardManager.updateCardStatus(id, status);
}

let _editingCard = $state<LearningCard | null>(null);

function _handleCardEdit(card: LearningCard) {
	_editingCard = card;
}

async function _handleEditSubmit(data: {
	id: string;
	title: string;
	prompt: string;
	topic?: string;
	project?: string;
}) {
	await cardManager.updateCard(data);
	_editingCard = null;
}

function _handleEditCancel() {
	_editingCard = null;
}

async function _handleCardDelete(id: string) {
	if (window.confirm("Are you sure you want to delete this learning card?")) {
		await cardManager.deleteCard(id);
	}
}
</script>

<section class="project-detail">
  <header>
    <h2>{_project ? _project.name : 'Project'}</h2>
    <div class="actions">
      <button
        class="primary"
        onclick={_openAddForm}
        type="button"
      >
        + New Learning Item
      </button>
    </div>
  </header>

  

  {#if _editingCard}
    <dialog open class="modal-overlay" onclick={(e) => { if (e.target === e.currentTarget) _handleEditCancel(); }} onkeydown={(e) => e.key === 'Escape' && _handleEditCancel()}>
      <div
        class="modal-content"
        aria-labelledby="edit-heading"
        role="document"
      >
        <EditCardForm 
          card={_editingCard}
          onSubmit={_handleEditSubmit}
          onCancel={_handleEditCancel}
        />
      </div>
    </dialog>
  {/if}

  <CardList
    onStart={_handleStart}
    onToggle={_handleCardToggle}
    onEdit={_handleCardEdit}
    onDelete={_handleCardDelete}
  />
</section>

<style>
  .project-detail { padding:1rem; }
  .actions { display:flex; gap:8px; }
</style>
