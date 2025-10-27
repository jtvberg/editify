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
		if ($editMode && type === 'text') {
			const target = e.target as HTMLElement;
			const newContent = target.textContent || '';
			
			if (newContent !== content) {
				const success = await saveContent(ref, newContent);
				if (success) {
					content = newContent;
				}
			}
		}
	}

	async function handleInput(e: Event) {
		if ($editMode && (type === 'text' || type === 'rich-text')) {
			const target = e.target as HTMLElement;
			const newContent = type === 'rich-text' ? target.innerHTML : (target.textContent || '');
			content = newContent;
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={localElement}
	data-cms-ref={ref}
	data-cms-type={type}
	contenteditable={$editMode && (type === 'text' || type === 'rich-text')}
	class="cms-content"
	class:cms-editable={$editMode}
	onclick={handleClick}
	onblur={handleBlur}
	oninput={handleInput}
	role={$editMode ? 'textbox' : undefined}
	tabindex={$editMode ? 0 : undefined}
>
	{#if children}
		{@render children()}
	{:else if type === 'rich-text'}
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
		outline: 2px dashed rgba(59, 130, 246, 0.5);
		outline-offset: 2px;
		transition: outline 0.2s;
		cursor: pointer;
	}

	.cms-editable:hover {
		outline: 2px solid rgba(59, 130, 246, 0.8);
		background-color: rgba(59, 130, 246, 0.05);
	}

	.cms-editable:focus {
		outline: 2px solid rgb(59, 130, 246);
		background-color: rgba(59, 130, 246, 0.1);
		cursor: text;
	}
</style>
