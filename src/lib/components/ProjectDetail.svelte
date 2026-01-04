<script lang="ts">
  import { projectManager } from '../projectManager.svelte';
  import { cardManager } from '../cardManager.svelte';
  import AddForm from './AddForm.svelte';
  import CardList from './CardList.svelte';
  import { onMount } from 'svelte';
  import type { Project } from '../../types';

  export let projectId: string;

  let project: Project | undefined;

  $: {
    if (projectManager.all && projectId) {
      project = projectManager.all.find(p => p.id === projectId);
    }
  }

  onMount(async () => {
    if (!projectManager.all || projectManager.all.length === 0) {
      await projectManager.loadProjects();
    }
  });

  function toggleAdd() {
    cardManager.toggleForm();
  }
</script>

<section class="project-detail">
  <header>
    <h2>{project ? project.name : 'Project'}</h2>
    <div class="actions">
      <button class="primary" onclick={toggleAdd} aria-expanded={cardManager.isFormOpen} aria-controls="add-section">+ New Learning Item</button>
    </div>
  </header>

  {#if cardManager.isFormOpen}
    <AddForm onSubmit={async (data) => {
      const hasProject = data.project && String(data.project).trim().length > 0;
      const project = hasProject ? data.project : (projectId || undefined);
      await cardManager.addCard({ ...data, project });
      cardManager.closeForm();
    }} />
  {/if}

  <CardList />
</section>

<style>
  .project-detail { padding:1rem; }
  .actions { display:flex; gap:8px; }
</style>
