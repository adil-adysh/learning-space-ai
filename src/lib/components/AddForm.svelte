<script lang="ts">
	import { isFormOpen } from '../stores';
	import { onMount, onDestroy } from 'svelte';
	import type { LearningCard } from '../../types';

	// Props
	export let onSubmit: (data: { title: string; prompt: string; topic?: string }) => Promise<void>;

	// Local state
	let title = '';
	let topic = '';
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
				topic: topic.trim() || undefined
			});

			// Success - clear form and close
			clearForm();
			isFormOpen.set(false);
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
		prompt = '';
		status = '';
	}

	function handleCancel() {
		clearForm();
		isFormOpen.set(false);
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
			if (e.key === 'Escape' && $isFormOpen) {
				handleCancel();
			}
		};
		
		window.addEventListener('keydown', handleGlobalKeydown);
		
		return () => {
			window.removeEventListener('keydown', handleGlobalKeydown);
		};
	});

</script>

{#if $isFormOpen}
	<section id="add-section">
		<form on:submit|preventDefault={handleSubmit}>
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
				<button type="button" class="ghost" on:click={handleCancel} disabled={isSubmitting}>
					Cancel
				</button>
			</div>
		</form>
	</section>
{/if}
