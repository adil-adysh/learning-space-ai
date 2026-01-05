<script lang="ts">
	import { cardManager } from '../cardManager.svelte';
	import { projectManager } from '../projectManager.svelte';
	import type { LearningCard } from '../../types';

	interface Props {
		card: LearningCard;
		onSubmit: (data: { id: string; title: string; prompt: string; topic?: string; project?: string }) => Promise<void>;
		onCancel: () => void;
	}

	const { card, onSubmit, onCancel }: Props = $props();

	// Local state using Svelte 5 runes
	let title = $state(card.title);
	let topic = $state(card.topic || '');
	let project = $state(card.project || '');
	let creatingProject = $state(false);
	let prompt = $state(card.prompt);
	let status = $state('');
	let isSubmitting = $state(false);

	// Derived validation state
	let titleError = $derived.by(() => {
		const trimmed = title.trim();
		if (trimmed.length === 0) return 'Title is required';
		if (trimmed.length < 3) return 'Title must be at least 3 characters';
		if (trimmed.length > 100) return 'Title must be less than 100 characters';
		return '';
	});

	let promptError = $derived.by(() => {
		const trimmed = prompt.trim();
		if (trimmed.length === 0) return 'Prompt is required';
		if (trimmed.length < 10) return 'Prompt must be at least 10 characters';
		if (trimmed.length > 1000) return 'Prompt must be less than 1000 characters';
		return '';
	});

	let projectError = $derived.by(() => {
		if (creatingProject) {
			const trimmed = project.trim();
			if (trimmed.length === 0) return 'Project name is required';
			if (trimmed.length < 2) return 'Project name must be at least 2 characters';
			if (trimmed.length > 50) return 'Project name must be less than 50 characters';
			if (projectManager.all.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
				return 'A project with this name already exists';
			}
		}
		return '';
	});

	let isValid = $derived.by(() => {
		return title.trim().length > 0 && 
		       prompt.trim().length > 0 && 
		       !titleError && 
		       !promptError && 
		       !projectError;
	});

	let formElement: HTMLElement | null = null;
	let firstFocusableElement: HTMLElement | null = null;
	let lastFocusableElement: HTMLElement | null = null;

	// Focus trap effect
	$effect(() => {
		// Set initial focus to title input
		const titleInput = document.getElementById('edit-title') as HTMLInputElement;
		if (titleInput) {
			setTimeout(() => titleInput.focus(), 0);
		}

		// Get all focusable elements within the form
		const updateFocusableElements = () => {
			if (!formElement) return;
			
			const focusableSelectors = 'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
			const focusableElements = formElement.querySelectorAll(focusableSelectors);
			
			if (focusableElements.length > 0) {
				firstFocusableElement = focusableElements[0] as HTMLElement;
				lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;
			}
		};

		updateFocusableElements();

		const handleTabKey = (e: KeyboardEvent) => {
			if (e.key !== 'Tab') return;

			updateFocusableElements();

			if (e.shiftKey) {
				if (document.activeElement === firstFocusableElement) {
					e.preventDefault();
					lastFocusableElement?.focus();
				}
			} else {
				if (document.activeElement === lastFocusableElement) {
					e.preventDefault();
					firstFocusableElement?.focus();
				}
			}
		};

		const handleGlobalKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onCancel();
			}
		};

		formElement?.addEventListener('keydown', handleTabKey);
		window.addEventListener('keydown', handleGlobalKeydown);

		return () => {
			formElement?.removeEventListener('keydown', handleTabKey);
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!isValid || isSubmitting) return;

		isSubmitting = true;
		status = '';

		try {
			await onSubmit({
				id: card.id,
				title: title.trim(),
				prompt: prompt.trim(),
				topic: topic.trim() || undefined,
				project: creatingProject ? project.trim() || undefined : (project || undefined),
			});

			announceToSR(`Card "${title}" updated successfully`);
		} catch (err) {
			status = err instanceof Error ? err.message : 'Failed to update card';
			announceToSR(status);
		} finally {
			isSubmitting = false;
		}
	}

	function handleProjectChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		if (select.value === '__create__') {
			creatingProject = true;
			project = '';
		} else {
			creatingProject = false;
			project = select.value;
		}
	}

	function announceToSR(message: string) {
		const announcer = document.getElementById('sr-announcements');
		if (announcer) {
			announcer.textContent = message;
		}
	}
</script>

<section id="edit-section" bind:this={formElement}>
	<form onsubmit={handleSubmit} aria-labelledby="edit-heading">
		<h2 id="edit-heading">Edit learning item</h2>

		{#if status}
			<div role="status" class="form-status">{status}</div>
		{/if}

		<div class="field">
			<label for="edit-title">
				Title <span class="required">*</span>
			</label>
			<input
				id="edit-title"
				bind:value={title}
				type="text"
				autocomplete="off"
				required
				disabled={isSubmitting}
				class:error={titleError}
			/>
			{#if titleError}
				<span class="error-message">{titleError}</span>
			{:else}
				<span class="hint">Choose a short title you'll recognize later.</span>
			{/if}
		</div>

		<div class="field">
			<label for="edit-topic">
				Topic <span class="optional">(optional)</span>
			</label>
			<input
				id="edit-topic"
				bind:value={topic}
				type="text"
				autocomplete="off"
				disabled={isSubmitting}
			/>
			<span class="hint">e.g., JavaScript, Design Patterns, Math</span>
		</div>

		<div class="field">
			<label for="edit-project-select">Project <span class="optional">(optional)</span></label>
			<select
				id="edit-project-select"
				bind:value={project}
				onchange={handleProjectChange}
				disabled={isSubmitting}
				aria-describedby="edit-project-hint"
			>
				<option value="">Select a project</option>
				{#each projectManager.all as p (p.id)}
					<option value={p.id}>{p.name}</option>
				{/each}
				<option value="__create__">+ Create new project...</option>
			</select>
			<span id="edit-project-hint" class="hint">Attach to an existing project or make a new one.</span>
		</div>

		{#if creatingProject}
			<div class="field">
				<label for="edit-project">New project name <span class="required">*</span></label>
				<input
					id="edit-project"
					bind:value={project}
					type="text"
					autocomplete="off"
					disabled={isSubmitting}
					class:error={projectError}
				/>
				{#if projectError}
					<span class="error-message">{projectError}</span>
				{:else}
					<span class="hint">Keep it concise and unique.</span>
				{/if}
			</div>
		{/if}

		<div class="field">
			<label for="edit-prompt">
				Learning prompt <span class="required">*</span>
			</label>
			<textarea
				id="edit-prompt"
				bind:value={prompt}
				required
				disabled={isSubmitting}
				placeholder="e.g. Explain the concept of closures in JavaScript"
				class:error={promptError}
			></textarea>
			{#if promptError}
				<span class="error-message">{promptError}</span>
			{:else}
				<span class="hint">Describe what you want to learn so the AI can help.</span>
			{/if}
		</div>

		<div class="form-actions">
			<button type="submit" class="primary" disabled={!isValid || isSubmitting}>
				{isSubmitting ? 'Saving...' : 'Save changes'}
			</button>
			<button type="button" class="ghost" onclick={onCancel} disabled={isSubmitting}>
				Cancel
			</button>
		</div>
	</form>
</section>
