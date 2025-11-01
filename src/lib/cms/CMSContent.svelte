<script lang="ts">
	import { onMount } from 'svelte';
	import { editMode, cmsStore, saveContent, countRefUsage, activeElement } from '$lib/cms';
	import type { ContentType } from '$lib/types/cms';

	interface Props {
		ref: string;
		type?: ContentType;
		children?: import('svelte').Snippet;
		element?: HTMLElement;
	}

	let {
		ref,
		type = 'text',
		children,
		element = $bindable()
	}: Props = $props();

	let content = $state('');
	let isEditing = $state(false);
	let localElement: HTMLElement;

	$effect(() => {
		const storeContent = $cmsStore[ref];
		if (storeContent) {
			content = storeContent.content;
		}
	});

	onMount(() => {
		if (localElement) {
			element = localElement;
		}
	});

	function handleClick(e: MouseEvent) {
		if ($editMode) {
			// Stop propagation to prevent backdrop from closing overlay
			e.stopPropagation();
			
			// Check if this element is already active
			if ($activeElement && $activeElement.element === e.currentTarget) {
				// Already active, don't do anything - let user keep editing
				return;
			}
			
			e.preventDefault();
			const target = e.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();
			
			activeElement.set({
				ref,
				type,
				element: target,
				usageCount: countRefUsage(ref),
				x: rect.left,
				y: rect.bottom + window.scrollY
			});
		}
	}

	async function handleBlur(e: FocusEvent) {
		// Don't auto-save on blur anymore - save/cancel buttons will handle this
	}

	async function handleInput(e: Event) {
		if ($editMode && (type === 'text' || type === 'html')) {
			const target = e.target as HTMLElement;
			const newContent = type === 'html' ? target.innerHTML : (target.textContent || '');
			content = newContent;
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={localElement}
	data-cms-ref={ref}
	data-cms-type={type}
	contenteditable={$editMode && (type === 'text' || type === 'html')}
	class="cms-content"
	class:cms-editable={$editMode}
	class:cms-image={type === 'image'}
	onclick={handleClick}
	onblur={handleBlur}
	oninput={handleInput}
	role={$editMode ? (type === 'image' ? 'button' : 'textbox') : undefined}
	tabindex={$editMode ? 0 : undefined}
>
	{#if children}
		{@render children()}
	{:else if type === 'image'}
		{#if content}
			<img src={content} alt="" />
		{:else}
			<div class="image-placeholder">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
				<span>Click to upload image</span>
			</div>
		{/if}
	{:else if type === 'html'}
		{@html content}
	{:else}
		{content}
	{/if}
</div>

<style>
	.cms-content {
		position: relative;
	}

	.cms-editable {
		outline: 2px dashed #3b82f680;
		outline-offset: 2px;
		transition: outline 0.2s;
		cursor: pointer;
	}

	.cms-editable:hover {
		outline: 2px solid #3b82f6cc;
		background-color: #3b82f60d;
	}

	.cms-editable:focus {
		outline: 2px solid #3b82f6ff;
		background-color: #3b82f61a;
		cursor: text;
	}

	.cms-image.cms-editable:focus {
		cursor: pointer;
	}

	.cms-image img {
		max-width: 100%;
		height: auto;
		display: block;
	}

	/* Remove outline from parent div for images, apply to img instead */
	.cms-image.cms-editable {
		outline: none !important;
		background-color: transparent !important;
	}

	.cms-image.cms-editable img {
		outline: 2px dashed #3b82f680;
		outline-offset: 2px;
		transition: outline 0.2s, background-color 0.2s;
	}

	.cms-image.cms-editable:hover img {
		outline: 2px solid #3b82f6cc;
		background-color: #3b82f60d;
	}

	.cms-image.cms-editable:focus img {
		outline: 2px solid #3b82f6ff;
		background-color: #3b82f61a;
	}

	.image-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem 2rem;
		background-color: #f9fafbff;
		border: 2px dashed #d1d5dbff;
		border-radius: 8px;
		color: #6b7280ff;
		text-align: center;
		min-height: 200px;
	}

	.cms-editable .image-placeholder {
		cursor: pointer;
		transition: all 0.2s;
	}

	.cms-editable:hover .image-placeholder {
		background-color: #f3f4f6ff;
		border-color: #3b82f6cc;
		color: #3b82f6ff;
	}

	.image-placeholder span {
		font-size: 0.875rem;
		font-weight: 500;
	}
</style>
