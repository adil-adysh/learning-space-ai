<script lang="ts">
  import { projectManager } from '../projectManager.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function openProject(p: string) {
    projectManager.selectProject(p);
    dispatch('open', { projectId: p });
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
        {#each projectManager.all as p}
          <li>
            <button class="project-card" onclick={() => openProject(p.id)} aria-label={`Open project ${p.name}`}>
              <span class="project-name">{p.name}</span>
            </button>
          </li>
      {/each}
    {/if}
  </ul>
</section>

<style>
  .projects { padding: 1rem; }
  .actions { display:flex; gap:8px; align-items:center; }
  .project-list { list-style:none; padding:0; margin:1rem 0; display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:0.75rem; }
  .project-card { width:100%; text-align:left; padding:0.75rem; border-radius:6px; border:1px solid var(--muted,#ddd); background:var(--card,#fff); }
  .project-name { font-weight:600; }
  .empty { color:var(--muted,#666); }
</style>

<!-- ProjectsList has no inline form; creation handled on project-create screen -->