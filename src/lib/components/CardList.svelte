<script lang="ts">
	import { cardManager } from '../cardManager.svelte';
	import { projectManager } from '../projectManager.svelte';
	import CardItem from './CardItem.svelte';
	import type { LearningCard } from '../../types';

	interface Props {
		onStart: (prompt: string) => void;
		onToggle: (id: string, status: 'active' | 'done') => void;
	}

	const { onStart, onToggle }: Props = $props();

	// Helper function to group cards by project
	function groupByProject(list: LearningCard[]) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const map = new Map<string, LearningCard[]>();
		for (const c of list) {
			const key = c.project || '';
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(c);
		}
		const groups: { project: string; cards: LearningCard[]; headingId: string }[] = [];
		for (const [project, cards] of map.entries()) {
			groups.push({
				project,
				cards,
				headingId: `project-${(project || 'unassigned').replace(/\s+/g, '-')}`,
			});
		}
		// sort by project name when possible
		groups.sort((a, b) => {
			const aName = a.project
				? projectManager.all.find(p => p.id === a.project)?.name || a.project
				: 'Unassigned';
			const bName = b.project
				? projectManager.all.find(p => p.id === b.project)?.name || b.project
				: 'Unassigned';
			return aName.localeCompare(bName);
		});
		return groups;
	}

	// Derived computed groups
	const groupedCards = $derived.by(() => {
		if (cardManager.filterProject === 'all') {
			return groupByProject(cardManager.filtered);
		}
		return [];
	});

	function handleProjectFilter(e: Event) {
		const select = e.target as HTMLSelectElement;
		cardManager.setFilterProject(select.value);
	}

	function handleStatusFilter(e: Event) {
		const select = e.target as HTMLSelectElement;
		cardManager.setFilterStatus(select.value as 'all' | 'active' | 'done');
	}

	function handleSearchInput(e: Event) {
		const input = e.target as HTMLInputElement;
		cardManager.setFilterQuery(input.value);
	}
</script>

<section>
	<h2>Your learning cards</h2>

	<div class="filters">
		<label class="filter">
			Project:
			<select onchange={handleProjectFilter} aria-label="Filter by project">
				<option value="all">All projects</option>
				<option value="">Unassigned</option>
				{#each projectManager.all as p (p.id)}
					<option value={p.id}>{p.name}</option>
				{/each}
			</select>
		</label>

		<label class="filter">
			Show:
			<select onchange={handleStatusFilter}>
				<option value="all">All ({cardManager.all.length})</option>
				<option value="active">Active ({cardManager.activeCards.length})</option>
				<option value="done">Completed ({cardManager.completedCards.length})</option>
			</select>
		</label>

		<label class="filter search">
			Search:
			<input
				type="search"
				placeholder="Search title, prompt, topic, project"
				oninput={handleSearchInput}
				aria-label="Search cards"
			/>
		</label>
	</div>

	<div class="card-list">
		{#if cardManager.filtered.length === 0}
			<p class="empty-state" role="status" aria-live="polite">
				No learning cards match your filters.
			</p>
		{:else if cardManager.filterProject === 'all'}
			{#each groupedCards as group (group.headingId)}
				<section class="project-group" aria-labelledby={group.headingId}>
					<h3 id={group.headingId}>
						{group.project
							? projectManager.all.find(p => p.id === group.project)?.name || group.project
							: 'Unassigned'}
					</h3>
					{#each group.cards as card (card.id)}
						<CardItem {card} {onStart} {onToggle} />
					{/each}
				</section>
			{/each}
		{:else}
			{#each cardManager.filtered as card (card.id)}
				<CardItem {card} {onStart} {onToggle} />
			{/each}
		{/if}
	</div>
</section>
