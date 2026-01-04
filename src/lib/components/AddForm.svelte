<script lang="ts">
	import { cardManager } from '../cardManager.svelte';
	import { projectManager } from '../projectManager.svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { LearningCard } from '../../types';

	// Props
	export let onSubmit: (data: { title: string; prompt: string; topic?: string; project?: string }) => Promise<void>;

	// Local state
	let title = '';
	let topic = '';
	let project = '';
	let creatingProject = false;
	let prompt = '';
	let status = '';
	let isSubmitting = false;

	// Reactive validation
	$: isValid = title.trim().length > 0 && prompt.trim().length > 0;

	async function handleSubmit() {
		if (!isValid || isSubmitting) return;

		isSubmitting = true;
		status = '';

		try {
			await onSubmit({
				title: title.trim(),
				prompt: prompt.trim(),
				topic: topic.trim() || undefined,
				project: creatingProject ? project.trim() || undefined : (project || undefined)
			});

			// Success - clear form and close
			clearForm();
			cardManager.closeForm();
			status = 'Card added successfully!';
			
			// Announce to screen readers
			announceToSR(status);
		} catch (err) {
			status = err instanceof Error ? err.message : 'Failed to add card';
			announceToSR(status);
		} finally {
			isSubmitting = false;
		}
	}

	function clearForm() {
		title = '';
		topic = '';
		project = '';
		creatingProject = false;
		prompt = '';
		status = '';
	}

	function handleCancel() {
		clearForm();
		cardManager.closeForm();
	}

	function announceToSR(message: string) {
		const announcer = document.getElementById('sr-announcements');
		if (announcer) {
			announcer.textContent = message;
		}
	}

	// Global keydown handler for Escape
	onMount(() => {
		const handleGlobalKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && cardManager.isFormOpen) {
				handleCancel();
			}
		};
		
		window.addEventListener('keydown', handleGlobalKeydown);
		
		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

</script>

{#if cardManager.isFormOpen}
	<section id="add-section">
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} aria-labelledby="add-heading">
			<h2>New Card Details</h2>

			{#if status}
				<div role="status" class="form-status">{status}</div>
			{/if}

			<div class="field">
				<label for="title">
					Title <span class="required">*</span>
				</label>
				<input
					id="title"
					bind:value={title}
					type="text"
					autocomplete="off"
					required
					disabled={isSubmitting}
				/>
				<span class="hint">Give your learning card a clear, memorable name.</span>
			</div>

			<div class="field">
				<label for="topic">
					Topic <span class="optional">(optional)</span>
				</label>
				<input
					id="topic"
					bind:value={topic}
					type="text"
					autocomplete="off"
					disabled={isSubmitting}
				/>
				<span class="hint">e.g., JavaScript, Design Patterns, Math</span>
			</div>

			<div class="field">
				<label for="project-select">Project <span class="optional">(optional)</span></label>
				<select id="project-select" bind:value={project} onchange={() => { if (project === '__create__') { creatingProject = true; project = ''; } else { creatingProject = false; } }} disabled={isSubmitting} aria-describedby="project-hint">
					<option value="all">All projects</option>
					<option value="">Unassigned</option>
					{#each projectManager.all as p}
						<option value={p.id}>{p.name}</option>
					{/each}
					<option value="__create__">+ Create new project...</option>
				</select>
				<span id="project-hint" class="hint">Assign this card to a project or create a new one.</span>
			</div>

			{#if creatingProject}
				<div class="field">
					<label for="project">New project name</label>
					<input id="project" bind:value={project} type="text" autocomplete="off" disabled={isSubmitting} />
					<span class="hint">Give your project a short, unique name.</span>
				</div>
			{/if}

			<div class="field">
				<label for="prompt">
					Learning prompt <span class="required">*</span>
				</label>
				<textarea
					id="prompt"
					bind:value={prompt}
					required
					disabled={isSubmitting}
					placeholder="e.g. Explain the concept of closures in JavaScript"
				></textarea>
				<span class="hint">What do you want to learn or understand?</span>
			</div>

			<div class="form-actions">
				<button type="submit" class="primary" disabled={!isValid || isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save card'}
				</button>
				<button type="button" class="ghost" onclick={handleCancel} disabled={isSubmitting}>
					Cancel
				</button>
			</div>
		</form>
	</section>
{/if}
