<script lang="ts">
	import { onMount } from 'svelte';
	import { projectManager } from '../lib/projectManager.svelte';
	import { cardManager } from '../lib/cardManager.svelte';
	import AddForm from '../lib/components/AddForm.svelte';
	import CardList from '../lib/components/CardList.svelte';
	import ProjectsList from '../lib/components/ProjectsList.svelte';
	import ProjectCreate from '../lib/components/ProjectCreate.svelte';
	import ProjectDetail from '../lib/components/ProjectDetail.svelte';
	import '../styles.css';

	// Load initial data using Svelte 5 runes
	onMount(async () => {
		await Promise.all([
			cardManager.loadCards(),
			projectManager.loadProjects()
		]);
	});

	// Event handlers
	async function handleFormSubmit(data: { title: string; prompt: string; topic?: string; project?: string }) {
		await cardManager.addCard(data);
		announceToSR(`Card "${data.title}" added successfully`);
	}

	async function handleCardStart(prompt: string) {
		await cardManager.runPrompt(prompt);
		announceToSR('Opening prompt in ChatGPT');
	}

	async function handleCardToggle(id: string, status: 'active' | 'done') {
		await cardManager.updateCardStatus(id, status);
		announceToSR(`Card marked as ${status}`);
	}

	function toggleAddForm() {
		cardManager.toggleForm();
	}

	function announceToSR(message: string) {
		const announcer = document.getElementById('sr-announcements');
		if (announcer) {
			announcer.textContent = message;
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
				<button class="primary" onclick={() => projectManager.selectCreateProject()} aria-label="Create project">
					+ New Project
				</button>
			{:else}
				<button class="ghost" onclick={() => projectManager.selectProject('all')} aria-label="Back to projects">← Projects</button>
			{/if}
		</div>
	</header>

	<main id="main-content">
		{#if cardManager.isLoading || projectManager.isLoading}
			<p>Loading...</p>
		{:else}
			{#if projectManager.selectedProject === 'all'}
				<ProjectsList on:open={(e) => projectManager.selectProject(e.detail.projectId)} />
			{:else if projectManager.selectedProject === 'create'}
				<ProjectCreate on:created={async (e) => {
					await projectManager.loadProjects();
					projectManager.selectProject(e.detail.project);
				}} />
			{:else}
				<!-- Project detail view moved into component -->
				<ProjectDetail projectId={projectManager.selectedProject} />
			{/if}
		{/if}
	</main>
</div>

