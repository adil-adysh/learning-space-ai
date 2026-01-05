<script lang="ts">
  import { projectManager } from '../projectManager.svelte';
  import { cardManager } from '../cardManager.svelte';
  import AddForm from './AddForm.svelte';
  import EditCardForm from './EditCardForm.svelte';
  import CardList from './CardList.svelte';
  import type { LearningCard } from '../../types';

  interface Props {
    projectId: string;
  }

  const { projectId }: Props = $props();

  // Derived value: find current project
  const project = $derived.by(() => {
    if (!projectManager.all || !projectId) return undefined;
    return projectManager.all.find(p => p.id === projectId);
  });

  // Effect: Ensure projects are loaded
  $effect(() => {
    if (!projectManager.all || projectManager.all.length === 0) {
      projectManager.loadProjects();
    }
  });

  function handleToggleAdd() {
    cardManager.toggleForm();
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

  async function handleStart(card: LearningCard) {
    // Get the project's system prompt if the card belongs to a project
    let systemPrompt: string | undefined;
    if (card.project) {
      const proj = projectManager.all.find(p => p.id === card.project);
      systemPrompt = proj?.systemPrompt;
    }
    
    // Pass both the card prompt and system prompt
    await cardManager.runPromptWithSystem(card.prompt, systemPrompt);
  }

  async function handleCardToggle(id: string, status: 'active' | 'done') {
    await cardManager.updateCardStatus(id, status);
  }

  let editingCard = $state<LearningCard | null>(null);

  function handleCardEdit(card: LearningCard) {
    editingCard = card;
  }

  async function handleEditSubmit(data: { id: string; title: string; prompt: string; topic?: string; project?: string }) {
    await cardManager.updateCard(data);
    editingCard = null;
  }

  function handleEditCancel() {
    editingCard = null;
  }

  async function handleCardDelete(id: string) {
    if (confirm('Are you sure you want to delete this learning card?')) {
      await cardManager.deleteCard(id);
    }
  }
</script>

<section class="project-detail">
  <header>
    <h2>{project ? project.name : 'Project'}</h2>
    <div class="actions">
      <button
        class="primary"
        onclick={handleToggleAdd}
        aria-expanded={cardManager.isFormOpen}
        aria-controls="add-section"
      >
        + New Learning Item
      </button>
    </div>
  </header>

  {#if cardManager.isFormOpen}
    <AddForm onSubmit={handleFormSubmit} />
  {/if}

  {#if editingCard}
    <div
      class="modal-overlay"
      role="presentation"
      tabindex="-1"
      onclick={handleEditCancel}
      onkeydown={(e) => e.key === 'Escape' && handleEditCancel()}
    >
      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-heading"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.key === 'Escape' && handleEditCancel()}
      >
        <EditCardForm 
          card={editingCard}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      </div>
    </div>
  {/if}

  <CardList
    onStart={handleStart}
    onToggle={handleCardToggle}
    onEdit={handleCardEdit}
    onDelete={handleCardDelete}
  />
</section>

<style>
  .project-detail { padding:1rem; }
  .actions { display:flex; gap:8px; }
</style>
