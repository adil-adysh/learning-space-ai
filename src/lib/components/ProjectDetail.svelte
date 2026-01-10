<script lang="ts">
/* biome-disable lint/correctness/noUnusedImports -- used in markup/modal (Svelte component imports) */
import type { LearningCard, LearningCardBundleV1 } from "../../types";
import { cardManager } from "../cardManager.svelte";
import { projectManager } from "../projectManager.svelte";
import { modalStore } from "../stores/modalStore";
import { AI_LEARNING_CARD_PROMPT } from "../constants/aiPrompts";
import { buildChatGPTUrl } from "../../util";
import AddForm from "./AddForm.svelte";
import ExportCardsModal from "./ExportCardsModal.svelte";
import CardList from "./CardList.svelte";
import EditCardForm from "./EditCardForm.svelte";
import ImportCardsModal from "./ImportCardsModal.svelte";
import { generateExportFilename } from "../utils/cardImportExport";
/* used in markup/modal */
void CardList;
void EditCardForm;

interface Props {
	projectId: string;
}

const { projectId }: Props = $props();

// Derived value: project name for filename and prompt; keep it reactive
const _projectName = $derived.by(() => {
	return _project?.name || "project";
});

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

function _handleOpenAI() {
	if (!_project) return;

	// Build prompt using the central AI prompt and include project context
	const prompt = `${AI_LEARNING_CARD_PROMPT}\n\nGenerate cards related to the project: "${_project.name}"`;
	const url = buildChatGPTUrl(prompt, _project.systemPrompt);
	window.open(url, "_blank");
}

function _handleExport() {
	if (!_project) return;
	cardManager.exportProjectCards(projectId, _project.name);
}

function _openImportModal() {
	modalStore.open(ImportCardsModal, {
		onImport: async (jsonData: string) => {
			await _handleImport(jsonData);
		},
		onCancel: () => modalStore.close(),
	});
}

function _openExportModal() {
	if (!_project) return;
	const bundle = cardManager.getExportBundleForProject(projectId);
	const filename = generateExportFilename(_project.name);
	modalStore.open(ExportCardsModal, {
		bundle,
		filename,
		onClose: () => modalStore.close(),
	});
}

async function _handleImport(jsonData: string) {
	// Parse JSON
	let parsedData: unknown;
	try {
		parsedData = JSON.parse(jsonData);
	} catch (err) {
		throw [{ field: "json", message: "Invalid JSON format" }];
	}

	// Validate
	const errors = cardManager.validateImportBundle(parsedData);
	if (errors.length > 0) {
		throw errors;
	}

	// Import
	await cardManager.importCardsToProject(
		parsedData as LearningCardBundleV1,
		projectId,
	);
}
</script>

<section class="project-detail">
  <header>
    <h2>{_project ? _project.name : 'Project'}</h2>
    <div class="actions">
      <button
        class="secondary"
        onclick={_handleOpenAI}
        type="button"
        title="Generate learning cards with AI"
      >
        🤖 Generate Learning Cards
      </button>
      <button
        class="secondary"
        onclick={_openImportModal}
        type="button"
        title="Import learning cards from JSON"
      >
        📥 Import
      </button>
      <button
        class="secondary"
        onclick={_openExportModal}
        type="button"
        title="Preview and download learning cards"
      >
        📤 Export
      </button>
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
  .actions { display:flex; gap:8px; flex-wrap: wrap; }
  button.secondary { 
    background: #f0f0f0; 
    color: #333; 
    border: 1px solid #ddd;
  }
  button.secondary:hover { 
    background: #e0e0e0; 
  }
</style>
