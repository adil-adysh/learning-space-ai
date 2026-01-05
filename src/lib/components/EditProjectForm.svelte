<script lang="ts">
/* global HTMLElement setTimeout */
	import type { Project } from '../../types';

	interface Props {
		project: Project;
		onSubmit: (data: { id: string; name: string; systemPrompt?: string }) => Promise<void>;
		onCancel: () => void;
	}

	const { project, onSubmit, onCancel }: Props = $props();

	let formData = $state({
		name: project.name,
		systemPrompt: project.systemPrompt || '',
	});

	let fieldErrors = $state({
		name: '',
		systemPrompt: '',
	});

	let submissionError = $state('');
	let isSubmitting = $state(false);

	// Validate on input
	$effect(() => {
		const trimmedName = formData.name.trim();
		if (trimmedName.length === 0) {
			fieldErrors.name = 'Project name is required';
		} else if (trimmedName.length > 50) {
			fieldErrors.name = 'Project name must be less than 50 characters';
		} else {
			fieldErrors.name = '';
		}
	});

	$effect(() => {
		const trimmedSystemPrompt = formData.systemPrompt.trim();
		if (trimmedSystemPrompt.length > 8000) {
			fieldErrors.systemPrompt = 'System prompt must be less than 8000 characters';
		} else {
			fieldErrors.systemPrompt = '';
		}
	});

	let isValid = $derived(!fieldErrors.name && !fieldErrors.systemPrompt && formData.name.trim().length > 0);

	let formElement: HTMLElement | null = null;

	$effect(() => {
		const nameInput = document.getElementById('edit-project-name') as HTMLInputElement;
		if (nameInput) {
			setTimeout(() => nameInput.focus(), 0);
		}

		const handleGlobalKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onCancel();
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
		submissionError = '';

		try {
			const trimmedSystemPrompt = formData.systemPrompt.trim();
			await onSubmit({
				id: project.id,
				name: formData.name.trim(),
				systemPrompt: trimmedSystemPrompt || undefined,
			});

			announceToSR(`Project "${formData.name}" updated successfully`);
		} catch (err) {
			submissionError = err instanceof Error ? err.message : 'Failed to update project';
			announceToSR(submissionError);
		} finally {
			isSubmitting = false;
		}
	}

	function announceToSR(message: string) {
		const announcer = document.getElementById('sr-announcements');
		if (announcer) {
			announcer.textContent = message;
		}
	}
</script>

<section id="edit-project-section" bind:this={formElement}>
	<form onsubmit={handleSubmit} aria-labelledby="edit-project-heading">
		<h2 id="edit-project-heading">Edit Project</h2>

		{#if submissionError}
			<div role="alert" class="form-status error">{submissionError}</div>
		{/if}

		<div class="field">
			<label for="edit-project-name">
				Project name <span class="required">*</span>
			</label>
			<input
				id="edit-project-name"
				bind:value={formData.name}
				type="text"
				autocomplete="off"
				required
				disabled={isSubmitting}
				class:error={fieldErrors.name}
			/>
			{#if fieldErrors.name}
				<span class="error-message">{fieldErrors.name}</span>
			{:else}
				<span class="hint">Pick a clear name so you can find this project fast.</span>
			{/if}
		</div>

		<div class="field">
			<label for="edit-project-system-prompt">
				System prompt <span class="optional">(optional)</span>
			</label>
			<textarea
				id="edit-project-system-prompt"
				bind:value={formData.systemPrompt}
				disabled={isSubmitting}
				placeholder="Add context or constraints that should prefix every card prompt for this project."
				class:error={fieldErrors.systemPrompt}
				rows="6"
			></textarea>
			{#if fieldErrors.systemPrompt}
				<span class="error-message">{fieldErrors.systemPrompt}</span>
			{:else}
				<span class="hint">
					This text will auto-prepend to every card prompt in the project—great for tone, context, or guardrails. Max 500 characters.
				</span>
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
