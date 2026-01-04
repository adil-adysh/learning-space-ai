<script lang="ts">
	import { cardManager } from '../cardManager.svelte';
	import { projectManager } from '../projectManager.svelte';
	import CardItem from './CardItem.svelte';
	import type { LearningCard } from '../../types';

	export let onStart: (prompt: string) => void;
	export let onToggle: (id: string, status: 'active' | 'done') => void;

	function groupByProject(list: LearningCard[]) {
		const map = new Map<string, LearningCard[]>();
		for (const c of list) {
			const key = c.project || '';
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(c);
		}
		const groups: { project: string; cards: LearningCard[]; headingId: string }[] = [];
		for (const [project, cards] of map.entries()) {
			groups.push({ project, cards, headingId: `project-${(project || 'unassigned').replace(/\s+/g, '-')}` });
		}
		// sort by project name when possible
		groups.sort((a, b) => {
			const aName = a.project ? (projectManager.all.find(p => p.id === a.project)?.name || a.project) : 'Unassigned';
			const bName = b.project ? (projectManager.all.find(p => p.id === b.project)?.name || b.project) : 'Unassigned';
			return aName.localeCompare(bName);
		});
		return groups;
	}
</script>

<section>
	<h2>Your learning cards</h2>

	<div class="filters">
		<label class="filter">
			Project:
			<select onchange={(e) => cardManager.setFilterProject(e.currentTarget.value)} aria-label="Filter by project">
				<option value="all">All projects</option>
				<option value="">Unassigned</option>
				{#each projectManager.all as p}
					<option value={p.id}>{p.name}</option>
				{/each}
			</select>
		</label>

		<label class="filter">
			Show:
			<select onchange={(e) => cardManager.setFilterStatus(e.currentTarget.value)}>
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
				oninput={(e) => cardManager.setFilterQuery(e.currentTarget.value)}
				aria-label="Search cards"
			/>
		</label>
	</div>

	<div class="card-list">
		{#if cardManager.filtered.length === 0}
			<p class="empty-state" role="status" aria-live="polite">No learning cards match your filters.</p>
		{:else}
			{#if cardManager.filterProject === 'all'}
					{#each groupByProject(cardManager.filtered) as group}
					<section class="project-group" aria-labelledby={group.headingId}>
						<h3 id={group.headingId}>{group.project ? (projectManager.all.find(p => p.id === group.project)?.name || group.project) : 'Unassigned'}</h3>
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
		{/if}
	</div>
</section>
