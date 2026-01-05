<script lang="ts">
	import type { LearningCard } from '../../types';
	import { projectManager } from '../projectManager.svelte';
	import MoreMenu from './MoreMenu.svelte';

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
		<label class="check">
			<input
				type="checkbox"
				checked={isDone}
				onchange={() => onToggle(card.id, isDone ? 'active' : 'done')}
				aria-label={isDone ? `Mark ${card.title} as active` : `Mark ${card.title} as done`}
			/>
			<span class="check-label">{isDone ? 'Completed' : 'Mark done'}</span>
		</label>
		<MoreMenu ariaLabel={`More actions for ${card.title}`} on:edit={() => onEdit?.(card)} on:delete={() => onDelete?.(card.id)} />
	</footer>
</article>


<style>
	.card {
		margin-bottom: 1rem;
	}

	.check {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.check input[type="checkbox"] {
		width: 1.1rem;
		height: 1.1rem;
	}

	.check-label {
		font-size: 0.9rem;
		color: var(--muted, #666);
	}

	.done {
		opacity: 0.7;
	}

	/* moved danger styles to MoreMenu where Delete lives */
</style>
