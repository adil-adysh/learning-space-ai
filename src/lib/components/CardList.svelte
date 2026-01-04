<script lang="ts">
	import { cards, filteredCards, activeCards, completedCards, setFilterStatus, setFilterQuery } from '../stores';
	import CardItem from './CardItem.svelte';
	import type { LearningCard } from '../../types';

	export let onStart: (prompt: string) => void;
	export let onToggle: (id: string, status: 'active' | 'done') => void;
</script>

<section>
	<h2>Your learning cards</h2>

	<div class="filters">
		<label class="filter">
			Show:
			<select on:change={(e) => setFilterStatus(e.currentTarget.value)}>
				<option value="all">All ({$cards.length})</option>
				<option value="active">Active ({$activeCards.length})</option>
				<option value="done">Completed ({$completedCards.length})</option>
			</select>
		</label>

		<label class="filter search">
			Search:
			<input
				type="search"
				placeholder="Search title, prompt, topic"
				on:input={(e) => setFilterQuery(e.currentTarget.value)}
			/>
		</label>
	</div>

	<div class="card-list">
		{#if $filteredCards.length === 0}
			<p class="empty-state">No learning cards match your filters.</p>
		{:else}
			{#each $filteredCards as card (card.id)}
				<CardItem {card} {onStart} {onToggle} />
			{/each}
		{/if}
	</div>
</section>
