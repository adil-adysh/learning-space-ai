<script lang="ts">
	import { projectManager } from '../lib/projectManager.svelte';
	import { cardManager } from '../lib/cardManager.svelte';
	import ProjectsList from '../lib/components/ProjectsList.svelte';
	import ProjectCreate from '../lib/components/ProjectCreate.svelte';
	import ProjectDetail from '../lib/components/ProjectDetail.svelte';
	import '../styles.css';

	// Initial data load effect
	$effect.pre(() => {
		const loadInitialData = async () => {
			await Promise.all([cardManager.loadCards(), projectManager.loadProjects()]);
		};
		loadInitialData();
	});

	function handleProjectCreated(detail: { project: string }) {
		const projectId = detail.project;
		projectManager.selectProject(projectId);
	}

	let selectedProjectId = $state(projectManager.selectedProject);

	$effect(() => {
		selectedProjectId = projectManager.selectedProject;
	});

	function handleProjectFilterChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		const projectId = select.value;
		if (projectId === 'all') {
			projectManager.selectAll();
		} else if (projectId) {
			projectManager.selectProject(projectId);
		}
	}
</script>

<svelte:head>
	<title>Learning Cards</title>
	<meta name="description" content="Finish what you start" />
</svelte:head>

<!-- Screen reader announcements - SvelteKit handles route announcements automatically -->
<div id="sr-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div>

<div class="container">
	<header>
		<h1>Learning Cards</h1>
		<p class="subtitle">Finish what you start</p>
		<div class="top-actions">
			{#if projectManager.selectedProject === 'all'}
				<button
					class="primary"
					onclick={() => projectManager.selectCreateProject()}
					aria-label="Create project"
				>
					+ New Project
				</button>
			{:else if projectManager.selectedProject === 'create'}
				<button
					class="ghost"
					onclick={() => projectManager.selectProject('all')}
					aria-label="Back to projects"
				>
					← Projects
				</button>
			{:else}
				<!-- Viewing a specific project: show filter and back button -->
				<div class="project-controls">
					<label class="project-filter">
						Project:
						<select 
							value={projectManager.selectedProject}
							onchange={handleProjectFilterChange}
							aria-label="Switch project"
						>
							<option value="all">All projects</option>
							{#each projectManager.all as p (p.id)}
								<option value={p.id}>{p.name}</option>
							{/each}
						</select>
					</label>
					<button
						class="ghost"
						onclick={() => projectManager.selectProject('all')}
						aria-label="Back to projects"
					>
						← Projects
					</button>
				</div>
			{/if}
		</div>
	</header>

	<main id="main-content">
		{#if cardManager.isLoading || projectManager.isLoading}
			<p>Loading...</p>
		{:else if projectManager.selectedProject === 'all'}
			<ProjectsList onopen={(e) => projectManager.selectProject(e.projectId)} />
		{:else if projectManager.selectedProject === 'create'}
			<ProjectCreate oncreated={handleProjectCreated} />
		{:else}
			<!-- Project detail view -->
			<ProjectDetail projectId={projectManager.selectedProject} />
		{/if}
	</main>
</div>

<style>
	.project-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.project-filter {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.project-filter select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: white;
		cursor: pointer;
	}
</style>