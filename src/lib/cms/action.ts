import { get } from 'svelte/store';
import { editMode, cmsStore, saveContent, countRefUsage, activeElement } from './index';

export function cms(node: HTMLElement) {
	const ref = node.getAttribute('data-cms-ref');
	const type = (node.getAttribute('data-cms-type') || 'text') as 'text' | 'html' | 'image';
	
	if (!ref) return;

	const placeholderContent = type === 'html' ? node.innerHTML : node.textContent || '';
	const imgElement = type === 'image' ? node.querySelector('img') : null;
	const storeContent = get(cmsStore)[ref]?.content;
	
	if (storeContent) {
		if (type === 'html') {
			node.innerHTML = storeContent;
		} else if (type === 'image' && imgElement) {
			imgElement.src = storeContent;
			const metadata = get(cmsStore)[ref]?.metadata;
			const objectFit = metadata?.objectFit || 'contain';
			imgElement.style.objectFit = get(editMode) ? 'contain' : objectFit;
		} else if (type === 'text') {
			node.textContent = storeContent;
		}
	}
	
	const unsubscribe = cmsStore.subscribe((store) => {
		const storeItem = store[ref];
		const content = storeItem?.content;
		const metadata = storeItem?.metadata;
		
		if (document.activeElement === node) {
			return;
		}
		
		if (content) {
			if (type === 'html' && content !== node.innerHTML) {
				node.innerHTML = content;
			} else if (type === 'image' && imgElement && content !== imgElement.src) {
				imgElement.src = content;
			} else if (type === 'text' && content !== node.textContent) {
				node.textContent = content;
			}
		} else if (storeItem && type !== 'image') {
			if (type === 'html') {
				node.innerHTML = placeholderContent;
			} else if (type === 'text') {
				node.textContent = placeholderContent;
			}
		}

		if (type === 'image' && imgElement && metadata) {
			const objectFit = metadata.objectFit || 'contain';
			imgElement.style.objectFit = get(editMode) ? 'contain' : objectFit;
		}
	});

	const unsubscribeEditMode = editMode.subscribe((isEditMode) => {
		if (isEditMode) {
			if (type === 'text' || type === 'html') {
				node.setAttribute('contenteditable', 'true');
			}
			node.classList.add('cms-editable');
			if (type === 'image') {
				node.classList.add('cms-image');
				if (imgElement) {
					imgElement.style.objectFit = 'contain';
				}
			}
		} else {
			node.removeAttribute('contenteditable');
			node.classList.remove('cms-editable');
			if (type === 'image') {
				node.classList.remove('cms-image');
				if (imgElement) {
					const metadata = get(cmsStore)[ref]?.metadata;
					const objectFit = metadata?.objectFit || 'contain';
					imgElement.style.objectFit = objectFit;
				}
			}
		}
	});

	function handleClick(e: MouseEvent) {
		if (get(editMode) && ref) {
			e.stopPropagation();

			const currentActive = get(activeElement);
			if (currentActive && currentActive.element === node) {
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
		// Auto save on blur if in edit mode and content has changed not imeplemented
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
