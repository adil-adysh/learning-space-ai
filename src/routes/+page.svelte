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
			{:else}
				<button
					class="ghost"
					onclick={() => projectManager.selectProject('all')}
					aria-label="Back to projects"
				>
					← Projects
				</button>
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

