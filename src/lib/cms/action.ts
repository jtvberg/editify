import { get } from 'svelte/store';
import { editMode, cmsStore, saveContent, countRefUsage, activeElement } from './index';

/**
 * Svelte action to make elements with data-cms-ref editable
 * Usage: <h1 data-cms-ref="home.title" data-cms-type="text" use:cms>Content</h1>
 */
export function cms(node: HTMLElement) {
	const ref = node.getAttribute('data-cms-ref');
	const type = (node.getAttribute('data-cms-type') || 'text') as 'text' | 'rich-text' | 'image' | 'link';
	
	if (!ref) return;

	// Store the initial content from Svelte (the fallback value)
	let initialContent = type === 'rich-text' ? node.innerHTML : node.textContent || '';
	let hasBeenEdited = false;
	
	// Check if we have content in the store
	const storeContent = get(cmsStore)[ref]?.content;
	if (storeContent) {
		// Use store content if available
		if (type === 'rich-text') {
			node.innerHTML = storeContent;
		} else {
			node.textContent = storeContent;
		}
		initialContent = storeContent;
	}
	
	// Update content when store changes (only if content is not empty)
	const unsubscribe = cmsStore.subscribe((store) => {
		const content = store[ref]?.content;
		// Only update if:
		// 1. Content exists and is not empty
		// 2. Not currently editing
		// 3. Content is different from what's displayed
		if (content && document.activeElement !== node) {
			if (type === 'rich-text' && content !== node.innerHTML) {
				node.innerHTML = content;
				initialContent = content;
			} else if (type === 'text' && content !== node.textContent) {
				node.textContent = content;
				initialContent = content;
			}
		}
	});

	// Update editability when edit mode changes
	const unsubscribeEditMode = editMode.subscribe((isEditMode) => {
		if (isEditMode && (type === 'text' || type === 'rich-text')) {
			node.setAttribute('contenteditable', 'true');
			node.classList.add('cms-editable');
		} else {
			node.removeAttribute('contenteditable');
			node.classList.remove('cms-editable');
		}
	});

	function handleClick(e: MouseEvent) {
		if (get(editMode) && ref) {
			const rect = node.getBoundingClientRect();
			
			activeElement.set({
				ref: ref,
				type,
				element: node,
				usageCount: countRefUsage(ref),
				x: rect.left,
				y: rect.bottom + window.scrollY
			});
		}
	}

	async function handleBlur() {
		if (get(editMode) && ref) {
			const newContent = type === 'rich-text' ? node.innerHTML : (node.textContent || '');
			
			console.log('[CMS Action] Blur event:', {
				ref,
				initialContent,
				newContent,
				changed: newContent !== initialContent
			});
			
			// Save if content changed
			if (newContent !== initialContent) {
				console.log('[CMS Action] Saving content...');
				const success = await saveContent(ref, newContent);
				console.log('[CMS Action] Save result:', success);
				if (success) {
					initialContent = newContent;
					hasBeenEdited = true;
				}
			}
		}
	}

	node.addEventListener('click', handleClick);
	node.addEventListener('blur', handleBlur);

	return {
		destroy() {
			unsubscribe();
			unsubscribeEditMode();
			node.removeEventListener('click', handleClick);
			node.removeEventListener('blur', handleBlur);
		}
	};
}
