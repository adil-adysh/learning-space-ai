<script lang="ts">
	import { onMount } from 'svelte';
	import { isFormOpen, isLoading, setCards, addCard, updateCardStatus } from '../lib/stores';
	import AddForm from '../lib/components/AddForm.svelte';
	import CardList from '../lib/components/CardList.svelte';
	import '../styles.css';
	import type { LearningCard } from '../types';

	// Load initial data
	onMount(async () => {
		isLoading.set(true);
		
		try {
			const rawCards = await window.api.getCards();
			const cards: LearningCard[] = rawCards
				.map((c: any) => ({
					...c,
					createdAt: new Date(c.createdAt),
				}))
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

			setCards(cards);
		} catch (err) {
			console.error('Failed to load cards:', err);
		} finally {
			isLoading.set(false);
		}
	});

	// Event handlers
	async function handleFormSubmit(data: { title: string; prompt: string; topic?: string }) {
		const newCard = await window.api.addCard(data);
		addCard(newCard);
		announceToSR(`Card "${data.title}" added successfully`);
	}

	async function handleCardStart(prompt: string) {
		await window.api.runPrompt(prompt);
		announceToSR('Opening prompt in ChatGPT');
	}

	async function handleCardToggle(id: string, status: 'active' | 'done') {
		const updated = await window.api.toggleCard(id, status);
		updateCardStatus(id, status);
		announceToSR(`Card marked as ${status}`);
	}

	function toggleAddForm() {
		isFormOpen.update(v => !v);
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
			<button 
				class="primary" 
				aria-expanded={$isFormOpen}
				aria-controls="add-section"
				on:click={toggleAddForm}
			>
				+ Add learning card
			</button>
		</div>
	</header>

	<main id="main-content">
		<AddForm onSubmit={handleFormSubmit} />
		
		{#if $isLoading}
			<p>Loading cards...</p>
		{:else}
			<CardList 
				onStart={handleCardStart} 
				onToggle={handleCardToggle}
			/>
		{/if}
	</main>
</div>

