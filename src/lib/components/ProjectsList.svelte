<script lang="ts">
  import { projectManager } from '../projectManager.svelte';
  import EditProjectForm from './EditProjectForm.svelte';
  import MoreMenu from './MoreMenu.svelte';
  import type { Project } from '../../types';

  interface Props {
    onopen?: (detail: { projectId: string }) => void;
  }

  const { onopen }: Props = $props();

  function handleOpenProject(projectId: string) {
    projectManager.selectProject(projectId);
    onopen?.({ projectId });
  }

  async function handleDeleteProject(e: Event, projectId: string) {
    e.stopPropagation();
    const project = projectManager.all.find(p => p.id === projectId);
    if (window.confirm(`Are you sure you want to delete the project "${project?.name}"?\n\nThis will unassign all cards from this project.`)) {
      await projectManager.deleteProject(projectId);
    }
  }

  let editingProject = $state<Project | null>(null);

  function handleEditProject(e: Event, projectId: string) {
    e.stopPropagation();
    const project = projectManager.all.find(p => p.id === projectId);
    if (project) {
      editingProject = project;
    }
  }

  // wrappers for menu-based actions (no DOM event available)
  function handleEditProjectFromMenu(projectId: string) {
    const project = projectManager.all.find(p => p.id === projectId);
    if (project) editingProject = project;
  }

  async function handleDeleteProjectFromMenu(projectId: string) {
    const project = projectManager.all.find(p => p.id === projectId);
    if (window.confirm(`Are you sure you want to delete the project "${project?.name}"?\n\nThis will unassign all cards from this project.`)) {
      await projectManager.deleteProject(projectId);
    }
  }

  async function handleEditSubmit(data: { id: string; name: string; systemPrompt?: string }) {
    await projectManager.updateProject(data);
    editingProject = null;
  }

  function handleEditCancel() {
    editingProject = null;
  }
</script>

<section class="projects">
  <header>
    <h2>Projects</h2>
    <div class="actions">
      <!-- Creation is handled on a dedicated screen — use header "New Project" -->
      <p class="hint">Create a project from the header above.</p>
    </div>
  </header>

  <ul class="project-list">
    {#if projectManager.all.length === 0}
      <li class="empty">No projects yet — create one.</li>
    {:else}
      {#each projectManager.all as p (p.id)}
        <li>
          <div class="project-card-wrapper">
            <button
              class="project-card"
              onclick={() => handleOpenProject(p.id)}
              aria-label={`Open project ${p.name}`}
            >
              <span class="project-name">{p.name}</span>
            </button>
            <div class="project-actions">
              <MoreMenu ariaLabel={`More actions for project ${p.name}`} on:edit={() => handleEditProjectFromMenu(p.id)} on:delete={() => handleDeleteProjectFromMenu(p.id)} />
            </div>
          </div>
        </li>
      {/each}
    {/if}
  </ul>

  {#if editingProject}
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
        aria-labelledby="edit-project-heading"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.key === 'Escape' && handleEditCancel()}
      >
        <EditProjectForm 
          project={editingProject}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      </div>
    </div>
  {/if}
</section>

<style>
  .projects { padding: 1rem; }
  .actions { display:flex; gap:8px; align-items:center; }
  .project-list { list-style:none; padding:0; margin:1rem 0; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:0.75rem; }
  .project-card-wrapper { position: relative; display: flex; flex-direction: column; }
  .project-card { width:100%; text-align:left; padding:0.75rem 0.75rem 2.5rem 0.75rem; border-radius:6px; border:1px solid var(--muted,#ddd); background:var(--card,#fff); }
  .project-name { font-weight:600; }
  .project-actions { position: absolute; bottom: 0.5rem; right: 0.5rem; display: flex; gap: 0.25rem; }
  .icon-btn { background: none; border: none; cursor: pointer; padding: 0.25rem; font-size: 1.2rem; opacity: 0.6; transition: opacity 0.2s; }
  .icon-btn:hover { opacity: 1; }
  /* danger hover moved to MoreMenu for consistent styling */
  .empty { color:var(--muted,#666); }
</style>

<!-- ProjectsList has no inline form; creation handled on project-create screen -->