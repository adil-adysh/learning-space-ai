<script lang="ts">
/* biome-disable lint/correctness/noUnusedImports -- used in template markup (Svelte component import) */
import type { LearningCard } from "../../types";
import { cardManager } from "../cardManager.svelte";
import { projectManager } from "../projectManager.svelte";
import CardItem from "./CardItem.svelte";
/* used in template markup */
void CardItem;

interface Props {
	onStart: (card: LearningCard) => void;
	onToggle: (id: string, status: "active" | "done") => void;
	onEdit?: (card: LearningCard) => void;
	onDelete?: (id: string) => void;
}

const {
	onStart: _onStart,
	onToggle: _onToggle,
	onEdit: _onEdit,
	onDelete: _onDelete,
}: Props = $props();

// Helper function to group cards by project
function groupByProject(list: LearningCard[]) {
	const map = new Map<string, LearningCard[]>();
	for (const c of list) {
		const key = c.project || "";
		if (!map.has(key)) map.set(key, []);
		map.get(key)?.push(c);
	}
	const groups: {
		project: string;
		cards: LearningCard[];
		headingId: string;
	}[] = [];
	for (const [project, cards] of map.entries()) {
		groups.push({
			project,
			cards,
			headingId: `project-${(project || "unassigned").replace(/\s+/g, "-")}`,
		});
	}
	// sort by project name when possible
	groups.sort((a, b) => {
		const aName = a.project
			? projectManager.all.find((p) => p.id === a.project)?.name || a.project
			: "Unassigned";
		const bName = b.project
			? projectManager.all.find((p) => p.id === b.project)?.name || b.project
			: "Unassigned";
		return aName.localeCompare(bName);
	});
	return groups;
}

// Derived computed groups
const _groupedCards = $derived.by(() => {
	if (cardManager.filterProject === "all") {
		return groupByProject(cardManager.filtered);
	}
	return [];
});

function _handleStatusFilter(e: Event) {
	const select = e.target as HTMLSelectElement;
	cardManager.setFilterStatus(select.value as "all" | "active" | "done");
}

function _handleSearchInput(e: Event) {
	const input = e.target as HTMLInputElement;
	cardManager.setFilterQuery(input.value);
}
</script>

<section>
	<h2>Your learning cards</h2>

	<div class="filters">
		<label class="filter">
			Show:
			<select onchange={_handleStatusFilter}>
				<option value="all">All ({cardManager.all.length})</option>
				<option value="active">Active ({cardManager.activeCards.length})</option>
				<option value="done">Completed ({cardManager.completedCards.length})</option>
			</select>
		</label>

		<label class="filter search">
			Search:
			<input
				type="search"
				placeholder="Search title, prompt, topic"
				oninput={_handleSearchInput}
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
			{#each _groupedCards as group (group.headingId)}
				<section class="project-group" aria-labelledby={group.headingId}>
					<h3 id={group.headingId}>
						{group.project
							? projectManager.all.find(p => p.id === group.project)?.name || group.project
							: 'Unassigned'}
					</h3>
					{#each group.cards as card (card.id)}
						<CardItem {card} onStart={_onStart} onToggle={_onToggle} onEdit={_onEdit} onDelete={_onDelete} />
					{/each}
				</section>
			{/each}
		{:else}
			{#each cardManager.filtered as card (card.id)}
				<CardItem {card} onStart={_onStart} onToggle={_onToggle} onEdit={_onEdit} onDelete={_onDelete} />
			{/each}
		{/if}
	</div>
</section>
