<script lang="ts">
	import type { LearningCard } from '../../types';
	
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
			on:click={() => onStart(card.prompt)}
		>
			Start in ChatGPT
		</button>
		<button 
			type="button" 
			class="ghost" 
			aria-pressed={isDone}
			on:click={() => onToggle(card.id, isDone ? 'active' : 'done')}
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
