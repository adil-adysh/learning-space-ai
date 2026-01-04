<script lang="ts">
	import type { LearningCard } from '../../types';
	import { projectManager } from '../projectManager.svelte';
	
	export let card: LearningCard;
	export let onStart: (prompt: string) => void;
	export let onToggle: (id: string, status: 'active' | 'done') => void;

	$: isDone = card.status === 'done';
	$: buttonLabel = isDone ? 'Mark active' : 'Mark done';
	$: statusText = isDone ? '✓ Completed' : 'Active';
</script>

<article class="card" class:done={isDone}>
	<header>
		<h3>{card.title}</h3>
		{#if card.topic}
			<p class="topic">{card.topic}</p>
		{/if}
		{#if card.project}
				<p class="project">Project: <strong>{projectManager.all.find(p => p.id === card.project)?.name || card.project}</strong></p>
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
			onclick={() => onStart(card.prompt)}
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
	</footer>
</article>

<style>
	.card {
		margin-bottom: 1rem;
	}
	
	.done {
		opacity: 0.7;
	}
</style>
