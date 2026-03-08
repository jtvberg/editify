<script lang="ts">
	import { editMode, isEditor } from '$lib/cms';
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	onMount(() => {
		// +layout.svelte $effect is the primary source of truth for isEditor
		// (uses server-validated getUser() via safeGetSession).
		// Only handle SIGNED_OUT here so the button hides immediately on sign-out
		// without waiting for a server round-trip.
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
			if (event === 'SIGNED_OUT') {
				isEditor.set(false);
				editMode.set(false);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});

	function toggleEditMode() {
		editMode.update(mode => !mode);
	}
</script>

{#if $isEditor}
	<button
		class="edit-mode-toggle"
		class:active={$editMode}
		onclick={toggleEditMode}
		aria-label={$editMode ? 'Exit edit mode' : 'Enter edit mode'}
		title={$editMode ? 'Exit edit mode' : 'Enter edit mode'}
	>
		{#if $editMode}
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 6 6 18" />
				<path d="m6 6 12 12" />
			</svg>
			<span>Exit Edit Mode</span>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
				<path d="m15 5 4 4" />
			</svg>
			<span>Edit Mode</span>
		{/if}
	</button>
{/if}

<style>
	.edit-mode-toggle {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background-color: var(--cms-overlay-bg);
		border: 2px solid var(--color-border-light);
		border-radius: 9999px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		cursor: pointer;
		font-weight: 600;
		color: var(--color-text-dark);
		transition: all 0.2s;
		z-index: 9999;
	}

	.edit-mode-toggle:hover {
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.06);
		transform: translateY(-2px);
	}

	.edit-mode-toggle.active {
		background-color: var(--cms-primary);
		border-color: var(--cms-primary);
		color: var(--cms-overlay-bg);
	}

	.edit-mode-toggle svg {
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.edit-mode-toggle span {
			display: none;
		}
		
		.edit-mode-toggle {
			padding: 0.75rem;
		}
	}
</style>
