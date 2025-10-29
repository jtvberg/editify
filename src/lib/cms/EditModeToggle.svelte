<script lang="ts">
	import { editMode, isEditor, checkEditorRole } from '$lib/cms';
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	onMount(() => {
		// Check editor role on mount
		checkEditorRole();

		// Listen for auth state changes and re-check role
		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
			// Re-check editor role when auth state changes
			await checkEditorRole();
		});

		// Cleanup subscription on unmount
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
		background-color: #ffffffff;
		border: 2px solid #e5e7ebff;
		border-radius: 9999px;
		box-shadow: 0 4px 6px -1px #0000001a, 0 2px 4px -1px #0000000f;
		cursor: pointer;
		font-weight: 600;
		color: #374151ff;
		transition: all 0.2s;
		z-index: 9999;
	}

	.edit-mode-toggle:hover {
		box-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -2px #0000000f;
		transform: translateY(-2px);
	}

	.edit-mode-toggle.active {
		background-color: #3b82f6ff;
		border-color: #3b82f6ff;
		color: #ffffffff;
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
