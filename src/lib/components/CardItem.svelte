<script lang="ts">
	import type { LearningCard } from '../../types';
	import { projectManager } from '../projectManager.svelte';

	interface Props {
		card: LearningCard;
		onStart: (card: LearningCard) => void;
		onToggle: (id: string, status: 'active' | 'done') => void;
		onEdit?: (card: LearningCard) => void;
		onDelete?: (id: string) => void;
	}

	const { card, onStart, onToggle, onEdit, onDelete }: Props = $props();

	// Derived computed values
	const isDone = $derived(card.status === 'done');
	const buttonLabel = $derived(isDone ? 'Mark active' : 'Mark done');
	const statusText = $derived(isDone ? '✓ Completed' : 'Active');
	const projectName = $derived.by(() => {
		if (!card.project) return '';
		return projectManager.all.find(p => p.id === card.project)?.name || card.project;
	});
</script>

<article class="card" class:done={isDone}>
	<header>
		<h3>{card.title}</h3>
		{#if card.topic}
			<p class="topic">{card.topic}</p>
		{/if}
		{#if card.project}
			<p class="project">Project: <strong>{projectName}</strong></p>
		{/if}
	</header>

	<section>
		<div class="status" class:done={isDone}>
			{statusText}
		</div>
		<pre class="prompt">{card.prompt}</pre>
	</section>

	<footer class="card-actions">
		<button
			type="button"
			class="primary"
			onclick={() => onStart(card)}
			aria-label={`Start chat with prompt for ${card.title}`}
		>
			Start in ChatGPT
		</button>
		<button
			type="button"
			class="ghost"
			aria-pressed={isDone}
			onclick={() => onToggle(card.id, isDone ? 'active' : 'done')}
			aria-label={isDone ? `Mark ${card.title} as active` : `Mark ${card.title} as done`}
		>
			{buttonLabel}
		</button>
		{#if onEdit}
			<button
				type="button"
				class="ghost"
				onclick={() => onEdit?.(card)}
				aria-label={`Edit ${card.title}`}
			>
				Edit
			</button>
		{/if}
		{#if onDelete}
			<button
				type="button"
				class="ghost danger"
				onclick={() => onDelete?.(card.id)}
				aria-label={`Delete ${card.title}`}
			>
				Delete
			</button>
		{/if}
	</footer>
</article>


<style>
	.card {
		margin-bottom: 1rem;
	}

	.done {
		opacity: 0.7;
	}

	.danger {
		color: #dc2626;
	}

	.danger:hover {
		background-color: #fef2f2;
		color: #991b1b;
	}
</style>
