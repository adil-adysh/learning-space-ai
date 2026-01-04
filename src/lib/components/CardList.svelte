<script lang="ts">
	import { cards } from '../stores';
	import CardItem from './CardItem.svelte';
	import type { LearningCard } from '../../types';

	export let onStart: (prompt: string) => void;
	export let onToggle: (id: string, status: 'active' | 'done') => void;
</script>

<section>
	<h2>Your learning cards</h2>
	<div class="card-list">
		{#if $cards.length === 0}
			<p class="empty-state">No learning cards yet. Create one to get started!</p>
		{:else}
			{#each $cards as card (card.id)}
				<CardItem 
					{card} 
					{onStart} 
					{onToggle}
				/>
			{/each}
		{/if}
	</div>
</section>
