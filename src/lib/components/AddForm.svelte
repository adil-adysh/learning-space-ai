<script lang="ts">
	import { cardManager } from '../cardManager.svelte';
	import { projectManager } from '../projectManager.svelte';

	interface Props {
		onSubmit: (data: { title: string; prompt: string; topic?: string; project?: string }) => Promise<void>;
	}

	const { onSubmit }: Props = $props();

	// Local state using Svelte 5 runes
	let title = $state('');
	let topic = $state('');
	let project = $state(projectManager.selectedProject !== 'all' && projectManager.selectedProject !== 'create' ? projectManager.selectedProject : '');
	let creatingProject = $state(false);
	let prompt = $state('');
	let status = $state('');
	let isSubmitting = $state(false);

	// Derived validation state
	let titleError = $derived.by(() => {
		const trimmed = title.trim();
		if (trimmed.length === 0) return '';
		if (trimmed.length < 3) return 'Title must be at least 3 characters';
		if (trimmed.length > 100) return 'Title must be less than 100 characters';
		return '';
	});

	let promptError = $derived.by(() => {
		const trimmed = prompt.trim();
		if (trimmed.length === 0) return '';
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
			// Check for duplicate project names
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

	// Side effect: Handle Escape key
	$effect(() => {
		if (!cardManager.isFormOpen) return;

		const handleGlobalKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				handleCancel();
			}
		};

		window.addEventListener('keydown', handleGlobalKeydown);

		return () => {
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
				title: title.trim(),
				prompt: prompt.trim(),
				topic: topic.trim() || undefined,
				project: creatingProject ? project.trim() || undefined : (project || undefined),
			});

			// Success - clear form and close
			clearForm();
			cardManager.closeForm();

			// Announce to screen readers
			announceToSR(`Card "${title}" added successfully`);
		} catch (err) {
			status = err instanceof Error ? err.message : 'Failed to add card';
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
</script>

{#if cardManager.isFormOpen}
	<section id="add-section">
		<form onsubmit={handleSubmit} aria-labelledby="add-heading">
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
					class:error={titleError}
				/>
				{#if titleError}
					<span class="error-message">{titleError}</span>
				{:else}
					<span class="hint">Give your learning card a clear, memorable name.</span>
				{/if}
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
				<select
					id="project-select"
					bind:value={project}
					onchange={handleProjectChange}
					disabled={isSubmitting}
					aria-describedby="project-hint"
				>
					<option value="">Select a project</option>
					{#each projectManager.all as p (p.id)}
						<option value={p.id}>{p.name}</option>
					{/each}
					<option value="__create__">+ Create new project...</option>
				</select>
				<span id="project-hint" class="hint">Assign this card to a project or create a new one.</span>
			</div>

			{#if creatingProject}
				<div class="field">
					<label for="project">New project name <span class="required">*</span></label>
					<input
						id="project"
						bind:value={project}
						type="text"
						autocomplete="off"
						disabled={isSubmitting}
						class:error={projectError}
					/>
					{#if projectError}
						<span class="error-message">{projectError}</span>
					{:else}
						<span class="hint">Give your project a short, unique name.</span>
					{/if}
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
					class:error={promptError}
				></textarea>
				{#if promptError}
					<span class="error-message">{promptError}</span>
				{:else}
					<span class="hint">What do you want to learn or understand?</span>
				{/if}
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
