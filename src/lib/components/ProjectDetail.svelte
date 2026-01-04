<script lang="ts">
  import { projectManager } from '../projectManager.svelte';
  import { cardManager } from '../cardManager.svelte';
  import AddForm from './AddForm.svelte';
  import CardList from './CardList.svelte';

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

  async function handleCardStart(prompt: string) {
    await cardManager.runPrompt(prompt);
  }

  async function handleCardToggle(id: string, status: 'active' | 'done') {
    await cardManager.updateCardStatus(id, status);
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

  <CardList
    onStart={handleCardStart}
    onToggle={handleCardToggle}
  />
</section>

<style>
  .project-detail { padding:1rem; }
  .actions { display:flex; gap:8px; }
</style>
