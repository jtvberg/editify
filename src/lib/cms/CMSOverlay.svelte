<script lang="ts">
	import { activeElement, editMode, saveContent, getContentHistory } from '$lib/cms';
	import { onMount } from 'svelte';

	let showHistory = $state(false);
	let history = $state<Array<{ id: string; content: string; created_at: string }>>([]);
	let uploading = $state(false);

	async function loadHistory() {
		if ($activeElement) {
			history = await getContentHistory($activeElement.ref);
			showHistory = true;
		}
	}

	function closeOverlay() {
		activeElement.set(null);
		showHistory = false;
	}

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (!file || !$activeElement) return;
		
		uploading = true;
		
		// TODO: Implement actual Supabase storage upload
		// For now, just show a placeholder
		console.log('Image upload:', file.name);
		
		uploading = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeOverlay();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if $editMode && $activeElement}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cms-overlay-backdrop" onclick={closeOverlay}></div>
	
	<div 
		class="cms-overlay"
		style="top: {$activeElement.y + 8}px; left: {$activeElement.x}px;"
	>
		<div class="cms-toolbar">
			<div class="toolbar-header">
				<span class="ref-id">{$activeElement.ref}</span>
				{#if $activeElement.usageCount > 1}
					<span class="usage-badge">
						Used in {$activeElement.usageCount} place{$activeElement.usageCount !== 1 ? 's' : ''}
					</span>
				{/if}
			</div>
			
			<div class="toolbar-actions">
				<button
					class="toolbar-button"
					onclick={loadHistory}
					title="View history"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
						<path d="M3 3v5h5" />
						<path d="M12 7v5l4 2" />
					</svg>
					History
				</button>
				
				<button
					class="toolbar-button close"
					onclick={closeOverlay}
					title="Close (Esc)"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			</div>
		</div>

		{#if $activeElement.type === 'image'}
			<div class="image-uploader">
				<input
					type="file"
					accept="image/*"
					onchange={handleImageUpload}
					disabled={uploading}
				/>
				{#if uploading}
					<p>Uploading...</p>
				{/if}
			</div>
		{:else if $activeElement.type === 'rich-text'}
			<div class="rich-text-toolbar">
				<button class="format-button" title="Bold">
					<strong>B</strong>
				</button>
				<button class="format-button" title="Italic">
					<em>I</em>
				</button>
				<button class="format-button" title="Link">
					🔗
				</button>
			</div>
		{/if}

		{#if showHistory}
			<div class="history-panel">
				<h3>Version History</h3>
				{#if history.length === 0}
					<p class="empty-state">No previous versions</p>
				{:else}
					<ul class="history-list">
						{#each history as version}
							<li class="history-item">
								<time>{new Date(version.created_at).toLocaleString()}</time>
								<div class="history-content">{version.content}</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.cms-overlay-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #0000001a;
		z-index: 9998;
	}

	.cms-overlay {
		position: absolute;
		background-color: #ffffffff;
		border-radius: 8px;
		box-shadow: 0 10px 25px -5px #0000001a, 0 10px 10px -5px #0000000a;
		z-index: 9999;
		min-width: 300px;
		max-width: 500px;
	}

	.cms-toolbar {
		padding: 1rem;
		border-bottom: 1px solid #e5e7ebff;
	}

	.toolbar-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.ref-id {
		font-family: monospace;
		font-size: 0.875rem;
		color: #6b7280ff;
		background-color: #f3f4f6ff;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.usage-badge {
		font-size: 0.75rem;
		background-color: #dbeafeff;
		color: #1e40afff;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		font-weight: 600;
	}

	.toolbar-actions {
		display: flex;
		gap: 0.5rem;
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		background-color: #ffffffff;
		border: 1px solid #e5e7ebff;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151ff;
		transition: all 0.15s;
	}

	.toolbar-button:hover {
		background-color: #f9fafbff;
		border-color: #d1d5dbff;
	}

	.toolbar-button.close {
		margin-left: auto;
	}

	.image-uploader,
	.rich-text-toolbar {
		padding: 1rem;
		border-bottom: 1px solid #e5e7ebff;
		display: flex;
		gap: 0.5rem;
	}

	.format-button {
		padding: 0.375rem 0.75rem;
		background-color: #ffffffff;
		border: 1px solid #e5e7ebff;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}

	.format-button:hover {
		background-color: #f9fafbff;
	}

	.history-panel {
		padding: 1rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.history-panel h3 {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827ff;
	}

	.empty-state {
		color: #6b7280ff;
		font-size: 0.875rem;
		text-align: center;
		padding: 2rem 1rem;
	}

	.history-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.history-item {
		padding: 0.75rem;
		background-color: #f9fafbff;
		border-radius: 6px;
		border: 1px solid #e5e7ebff;
	}

	.history-item time {
		display: block;
		font-size: 0.75rem;
		color: #6b7280ff;
		margin-bottom: 0.5rem;
	}

	.history-content {
		font-size: 0.875rem;
		color: #374151ff;
		line-height: 1.5;
	}
</style>
