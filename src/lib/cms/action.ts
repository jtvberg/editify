import { get } from 'svelte/store';
import { editMode, cmsStore, saveContent, countRefUsage, activeElement } from './index';

/**
 * Svelte action to make elements with data-cms-ref editable
 * Usage: <h1 data-cms-ref="home.title" data-cms-type="text" use:cms>Content</h1>
 */
export function cms(node: HTMLElement) {
	const ref = node.getAttribute('data-cms-ref');
	const type = (node.getAttribute('data-cms-type') || 'text') as 'text' | 'html' | 'image';
	
	if (!ref) return;

	// Store the initial content from Svelte (the fallback value)
	let initialContent = type === 'html' ? node.innerHTML : node.textContent || '';
	let hasBeenEdited = false;
	
	// For images, get the img element
	const imgElement = type === 'image' ? node.querySelector('img') : null;
	if (imgElement && type === 'image') {
		initialContent = imgElement.src;
	}
	
	// Check if we have content in the store
	const storeContent = get(cmsStore)[ref]?.content;
	if (storeContent) {
		// Use store content if available
		if (type === 'html') {
			node.innerHTML = storeContent;
		} else if (type === 'image' && imgElement) {
			imgElement.src = storeContent;
		} else if (type === 'text') {
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
			if (type === 'html' && content !== node.innerHTML) {
				node.innerHTML = content;
				initialContent = content;
			} else if (type === 'image' && imgElement && content !== imgElement.src) {
				imgElement.src = content;
				initialContent = content;
			} else if (type === 'text' && content !== node.textContent) {
				node.textContent = content;
				initialContent = content;
			}
		}
	});

	// Update editability when edit mode changes
	const unsubscribeEditMode = editMode.subscribe((isEditMode) => {
		if (isEditMode && (type === 'text' || type === 'html')) {
			node.setAttribute('contenteditable', 'true');
			node.classList.add('cms-editable');
		} else {
			node.removeAttribute('contenteditable');
			node.classList.remove('cms-editable');
		}
	});

	function handleClick(e: MouseEvent) {
		if (get(editMode) && ref) {
			// Stop propagation to prevent backdrop from closing overlay
			e.stopPropagation();
			
			// Check if this element is already active
			const currentActive = get(activeElement);
			if (currentActive && currentActive.element === node) {
				// Already active, don't do anything - let user keep editing
				return;
			}
			
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
		// Don't auto-save on blur anymore - save/cancel buttons will handle this
		// Just keep the content in memory for now
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
