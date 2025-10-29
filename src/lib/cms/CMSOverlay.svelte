<script lang="ts">
	import { activeElement, editMode, saveContent, getContentHistory, uploadImage, cmsStore } from '$lib/cms';
	import { onMount } from 'svelte';

	let showHistory = $state(false);
	let history = $state<Array<{ id: string; content: string; created_at: string }>>([]);
	let uploading = $state(false);
	let uploadError = $state<string | null>(null);
	let uploadSuccess = $state(false);
	let saving = $state(false);
	let showLinkInput = $state(false);
	let linkUrl = $state('');
	let linkText = $state('');
	let savedRange: Range | null = null;

	async function loadHistory() {
		if ($activeElement) {
			history = await getContentHistory($activeElement.ref);
			showHistory = true;
		}
	}

	async function restoreFromHistory(historyContent: string) {
		if (!$activeElement) return;
		
		const element = $activeElement.element;
		const type = $activeElement.type;
		
		// Update the element with the historical content
		if (type === 'text') {
			element.textContent = historyContent;
		} else if (type === 'rich-text') {
			element.innerHTML = historyContent;
		} else if (type === 'image') {
			const img = element.querySelector('img');
			if (img) {
				img.src = historyContent;
			}
		}
		
		// Close history panel after restoring
		showHistory = false;
	}

	function closeOverlay() {
		activeElement.set(null);
		showHistory = false;
		uploadError = null;
		uploadSuccess = false;
		showLinkInput = false;
		linkUrl = '';
		linkText = '';
		savedRange = null;
	}

	async function handleSave() {
		if (!$activeElement) return;
		
		saving = true;
		
		try {
			const element = $activeElement.element;
			const type = $activeElement.type;
			let newContent = '';
			
			if (type === 'text') {
				newContent = element.textContent || '';
			} else if (type === 'rich-text') {
				newContent = element.innerHTML;
			} else if (type === 'image') {
				const img = element.querySelector('img');
				newContent = img?.src || '';
			}
			
			const success = await saveContent($activeElement.ref, newContent);
			
			if (success) {
				// Success! Close the overlay
				closeOverlay();
			} else {
				uploadError = 'Failed to save changes';
			}
		} catch (err) {
			console.error('Save error:', err);
			uploadError = 'An error occurred while saving';
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		if (!$activeElement) return;
		
		// Revert changes by refreshing from store
		const element = $activeElement.element;
		const type = $activeElement.type;
		const ref = $activeElement.ref;
		
		// Get the original content from the store
		const storeContent = $cmsStore[ref]?.content;
		
		if (storeContent) {
			if (type === 'text') {
				element.textContent = storeContent;
			} else if (type === 'rich-text') {
				element.innerHTML = storeContent;
			} else if (type === 'image') {
				const img = element.querySelector('img');
				if (img) {
					img.src = storeContent;
				}
			}
		}
		
		closeOverlay();
	}

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (!file || !$activeElement) return;
		
		// Validate file type
		if (!file.type.startsWith('image/')) {
			uploadError = 'Please select a valid image file';
			return;
		}

		// Validate file size
		const maxSize = 6 * 1024 * 1024; // 6MB
		if (file.size > maxSize) {
			uploadError = 'Image size must be less than 5MB';
			return;
		}
		
		uploading = true;
		uploadError = null;
		uploadSuccess = false;
		
		try {
			const imageUrl = await uploadImage($activeElement.ref, file);
			
			if (imageUrl) {
				uploadSuccess = true;
				// Update all elements with this ref
				const elements = document.querySelectorAll(`[data-cms-ref="${$activeElement.ref}"]`);
				elements.forEach((el) => {
					const img = el.querySelector('img');
					if (img) {
						img.src = imageUrl;
					}
				});
				
				// Image upload auto-saves, so close overlay after a short delay
				setTimeout(() => {
					closeOverlay();
				}, 1500);
			} else {
				uploadError = 'Failed to upload image. Please try again.';
			}
		} catch (err) {
			console.error('Upload error:', err);
			uploadError = 'An unexpected error occurred during upload';
		} finally {
			uploading = false;
			// Reset the input
			input.value = '';
		}
	}

	function wrapSelection(tagName: string) {
		if (!$activeElement) return;
		
		const element = $activeElement.element;
		element.focus();
		
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		
		const range = selection.getRangeAt(0);
		
		// Check if selection is within our element
		if (!element.contains(range.commonAncestorContainer)) return;
		
		// Check if the selection is already wrapped in the tag
		let node = range.commonAncestorContainer;
		let isWrapped = false;
		
		// Walk up the tree to check if we're inside the tag already
		while (node && node !== element) {
			if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === tagName.toUpperCase()) {
				isWrapped = true;
				break;
			}
			node = node.parentNode!;
		}
		
		if (isWrapped && node) {
			// Unwrap: replace the tag with its contents
			const parent = node.parentNode!;
			while (node.firstChild) {
				parent.insertBefore(node.firstChild, node);
			}
			parent.removeChild(node);
		} else {
			// Wrap: create new tag and wrap selection
			const wrapper = document.createElement(tagName);
			
			try {
				range.surroundContents(wrapper);
			} catch (e) {
				// If surroundContents fails (partial selection), extract and wrap manually
				const contents = range.extractContents();
				wrapper.appendChild(contents);
				range.insertNode(wrapper);
			}
			
			// Restore selection
			selection.removeAllRanges();
			const newRange = document.createRange();
			newRange.selectNodeContents(wrapper);
			selection.addRange(newRange);
		}
		
		element.focus();
	}

	function toggleBold() {
		wrapSelection('strong');
	}

	function toggleItalic() {
		wrapSelection('em');
	}

	function toggleCode() {
		wrapSelection('code');
	}

	function toggleList(listType: 'ul' | 'ol') {
		if (!$activeElement) return;
		
		const element = $activeElement.element;
		element.focus();
		
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		
		const range = selection.getRangeAt(0);
		
		// Check if selection is within our element
		if (!element.contains(range.commonAncestorContainer)) return;
		
		// Check if we're already inside a list of this type
		let node = range.commonAncestorContainer;
		let existingList: HTMLElement | null = null;
		
		while (node && node !== element) {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const tagName = (node as Element).tagName;
				if (tagName === 'UL' || tagName === 'OL') {
					existingList = node as HTMLElement;
					break;
				}
			}
			node = node.parentNode!;
		}
		
		if (existingList) {
			// Remove the list - convert list items back to regular content
			const fragment = document.createDocumentFragment();
			const items = existingList.querySelectorAll('li');
			
			items.forEach((li) => {
				// Add line breaks between items for readability
				if (fragment.childNodes.length > 0) {
					fragment.appendChild(document.createElement('br'));
				}
				while (li.firstChild) {
					fragment.appendChild(li.firstChild);
				}
			});
			
			existingList.parentNode?.replaceChild(fragment, existingList);
		} else {
			// Create a new list
			const list = document.createElement(listType);
			
			// Get the selected content
			let content: DocumentFragment | null = null;
			
			if (!range.collapsed) {
				content = range.extractContents();
			} else {
				// No selection - create empty list item
				const li = document.createElement('li');
				li.appendChild(document.createTextNode('List item'));
				list.appendChild(li);
				range.insertNode(list);
				
				// Place cursor inside the list item
				range.setStart(li.firstChild!, 0);
				range.setEnd(li.firstChild!, li.textContent!.length);
				selection.removeAllRanges();
				selection.addRange(range);
				element.focus();
				return;
			}
			
			// Split content by line breaks or block elements to create list items
			if (content) {
				const textContent = content.textContent?.trim();
				
				if (textContent) {
					// Try to split by line breaks
					const lines = textContent.split('\n').filter(line => line.trim());
					
					if (lines.length > 1) {
						// Multiple lines - create list item for each
						lines.forEach(line => {
							const li = document.createElement('li');
							li.textContent = line.trim();
							list.appendChild(li);
						});
					} else {
						// Single line - create one list item
						const li = document.createElement('li');
						li.appendChild(content);
						list.appendChild(li);
					}
				} else {
					// Empty selection - create empty list item
					const li = document.createElement('li');
					li.textContent = 'List item';
					list.appendChild(li);
				}
			}
			
			range.insertNode(list);
			
			// Place cursor at the end of the list
			range.setStartAfter(list);
			range.setEndAfter(list);
			selection.removeAllRanges();
			selection.addRange(range);
		}
		
		element.focus();
	}

	function toggleUnorderedList() {
		toggleList('ul');
	}

	function toggleOrderedList() {
		toggleList('ol');
	}

	function showLinkDialog() {
		// Save the current selection range so we can restore it later
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			savedRange = selection.getRangeAt(0).cloneRange();
			
			// Get the selected text if any
			const selectedText = selection.toString();
			if (selectedText) {
				linkText = selectedText;
			}
		}
		showLinkInput = true;
	}

	function insertLink() {
		if (!linkUrl || !$activeElement) {
			showLinkInput = false;
			return;
		}
		
		const element = $activeElement.element;
		const selection = window.getSelection();
		if (!selection) return;
		
		// Restore the saved range if we have one
		let range: Range;
		if (savedRange) {
			range = savedRange;
			selection.removeAllRanges();
			selection.addRange(range);
		} else if (selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
		} else {
			// No saved range and no current selection - create one at the end
			range = document.createRange();
			range.selectNodeContents(element);
			range.collapse(false); // Collapse to end
			selection.removeAllRanges();
			selection.addRange(range);
		}
		
		// Create the link element
		const link = document.createElement('a');
		link.href = linkUrl;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		
		// Check if we have selected text to replace
		const hasSelection = !range.collapsed;
		
		if (hasSelection) {
			// Replace the selected text with the link
			const contents = range.extractContents();
			
			if (linkText) {
				// User provided custom link text, use that instead
				link.textContent = linkText;
			} else {
				// Use the selected text
				link.appendChild(contents);
			}
		} else {
			// No selection - use link text or URL
			link.textContent = linkText || linkUrl;
		}
		
		// Insert the link at the cursor position
		range.insertNode(link);
		
		// Place cursor after the link
		range.setStartAfter(link);
		range.setEndAfter(link);
		selection.removeAllRanges();
		selection.addRange(range);
		
		// Reset and close
		linkUrl = '';
		linkText = '';
		showLinkInput = false;
		savedRange = null;
		
		element.focus();
	}

	function cancelLink() {
		linkUrl = '';
		linkText = '';
		showLinkInput = false;
		savedRange = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (showLinkInput) {
				cancelLink();
			} else {
				handleCancel();
			}
		}
		
		// Handle Enter in link input
		if (e.key === 'Enter' && showLinkInput && (e.target as HTMLElement).tagName === 'INPUT') {
			e.preventDefault();
			insertLink();
		}
		
		// Only handle keyboard shortcuts when editing rich text
		if ($activeElement && $activeElement.type === 'rich-text') {
			// Bold: Cmd+B (Mac) or Ctrl+B (Windows/Linux)
			if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
				e.preventDefault();
				toggleBold();
			}
			
			// Italic: Cmd+I (Mac) or Ctrl+I (Windows/Linux)
			if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
				e.preventDefault();
				toggleItalic();
			}
			
			// Code: Cmd+` (Mac) or Ctrl+` (Windows/Linux)
			if ((e.metaKey || e.ctrlKey) && e.key === '`') {
				e.preventDefault();
				toggleCode();
			}
			
			// Link: Cmd+K (Mac) or Ctrl+K (Windows/Linux)
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				showLinkDialog();
			}
		}
	}

	function handleDocumentClick(e: MouseEvent) {
		if (!$activeElement) return;
		
		const target = e.target as HTMLElement;
		
		// Don't close if clicking on the overlay itself
		if (target.closest('.cms-overlay')) {
			return;
		}
		
		// Don't close if clicking on the active element or its children
		if ($activeElement.element.contains(target)) {
			return;
		}
		
		// Clicked outside - cancel editing
		handleCancel();
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('click', handleDocumentClick, true); // Use capture phase
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.removeEventListener('click', handleDocumentClick, true);
		};
	});
</script>

{#if $editMode && $activeElement}
	<div class="cms-overlay-backdrop"></div>
	
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
					class="toolbar-button save"
					onclick={handleSave}
					disabled={saving}
					title="Save changes"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
						<polyline points="17 21 17 13 7 13 7 21" />
						<polyline points="7 3 7 8 15 8" />
					</svg>
					{saving ? 'Saving...' : 'Save'}
				</button>
				
				<button
					class="toolbar-button cancel"
					onclick={handleCancel}
					disabled={saving}
					title="Cancel and discard changes"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
					Cancel
				</button>

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
			</div>
		</div>

		{#if $activeElement.type === 'image'}
			<div class="image-uploader">
				<label for="image-upload" class="upload-label">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="17 8 12 3 7 8" />
						<line x1="12" y1="3" x2="12" y2="15" />
					</svg>
					{uploading ? 'Uploading...' : 'Choose Image'}
				</label>
				<input
					id="image-upload"
					type="file"
					accept="image/*"
					onchange={handleImageUpload}
					disabled={uploading}
					class="file-input"
				/>
				
				{#if uploadError}
					<div class="upload-message error">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10" />
							<line x1="15" y1="9" x2="9" y2="15" />
							<line x1="9" y1="9" x2="15" y2="15" />
						</svg>
						{uploadError}
					</div>
				{/if}
				
				{#if uploadSuccess}
					<div class="upload-message success">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
							<polyline points="22 4 12 14.01 9 11.01" />
						</svg>
						Image uploaded successfully!
					</div>
				{/if}
				
				<p class="upload-info">Max size: 5MB. Supported formats: JPG, PNG, GIF, WebP</p>
			</div>
		{:else if $activeElement.type === 'rich-text'}
			<div class="rich-text-toolbar">
				<button 
					class="format-button" 
					onclick={toggleBold}
					title="Bold (Ctrl/Cmd+B)"
				>
					<strong>B</strong>
				</button>
				<button 
					class="format-button" 
					onclick={toggleItalic}
					title="Italic (Ctrl/Cmd+I)"
				>
					<em>I</em>
				</button>
				<button 
					class="format-button code-button" 
					onclick={toggleCode}
					title="Code (Ctrl/Cmd+`)"
				>
					<span>&lt;/&gt;</span>
				</button>
				<div class="toolbar-divider"></div>
				<button 
					class="format-button" 
					onclick={toggleUnorderedList}
					title="Bullet List"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="8" y1="6" x2="21" y2="6" />
						<line x1="8" y1="12" x2="21" y2="12" />
						<line x1="8" y1="18" x2="21" y2="18" />
						<line x1="3" y1="6" x2="3.01" y2="6" />
						<line x1="3" y1="12" x2="3.01" y2="12" />
						<line x1="3" y1="18" x2="3.01" y2="18" />
					</svg>
				</button>
				<button 
					class="format-button" 
					onclick={toggleOrderedList}
					title="Numbered List"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="10" y1="6" x2="21" y2="6" />
						<line x1="10" y1="12" x2="21" y2="12" />
						<line x1="10" y1="18" x2="21" y2="18" />
						<path d="M4 6h1v4" />
						<path d="M4 10h2" />
						<path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
					</svg>
				</button>
				<div class="toolbar-divider"></div>
				<button 
					class="format-button" 
					onclick={showLinkDialog}
					title="Insert Link (Ctrl/Cmd+K)"
				>
					🔗
				</button>
			</div>
			
			{#if showLinkInput}
				<div class="link-input-panel">
					<div class="input-group">
						<label for="link-url">URL</label>
						<input
							id="link-url"
							type="url"
							bind:value={linkUrl}
							placeholder="https://example.com"
							class="link-input"
						/>
					</div>
					<div class="input-group">
						<label for="link-text">Link Text (optional)</label>
						<input
							id="link-text"
							type="text"
							bind:value={linkText}
							placeholder="Click here"
							class="link-input"
						/>
					</div>
					<div class="link-actions">
						<button class="link-button primary" onclick={insertLink}>
							Insert Link
						</button>
						<button class="link-button" onclick={cancelLink}>
							Cancel
						</button>
					</div>
				</div>
			{/if}
		{/if}

		{#if showHistory}
			<div class="history-panel">
				<div class="history-header">
					<h3>Version History</h3>
					<button 
						class="history-close"
						onclick={() => showHistory = false}
						title="Close history"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				</div>
				{#if history.length === 0}
					<p class="empty-state">No previous versions</p>
				{:else}
					<ul class="history-list">
						{#each history as version}
							<li class="history-item">
								<div class="history-meta">
									<time>{new Date(version.created_at).toLocaleString()}</time>
									<button 
										class="restore-button"
										onclick={() => restoreFromHistory(version.content)}
										title="Restore this version"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
											<path d="M21 3v5h-5" />
											<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
											<path d="M3 21v-5h5" />
										</svg>
										Restore
									</button>
								</div>
								<div class="history-content">
									{#if $activeElement.type === 'image'}
										<img src={version.content} alt="Previous version" class="history-image" />
									{:else if $activeElement.type === 'rich-text'}
										{@html version.content}
									{:else}
										{version.content}
									{/if}
								</div>
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
		pointer-events: none;
	}

	.cms-overlay {
		position: absolute;
		background-color: #ffffffff;
		border-radius: 8px;
		box-shadow: 0 10px 25px -5px #0000001a, 0 10px 10px -5px #0000000a;
		z-index: 9999;
		min-width: 300px;
		max-width: 500px;
		pointer-events: auto;
	}

	.cms-toolbar {
		padding: 1rem;
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

	.toolbar-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toolbar-button.save {
		background-color: #3b82f6ff;
		color: #ffffffff;
		border-color: #3b82f6ff;
	}

	.toolbar-button.save:hover:not(:disabled) {
		background-color: #2563ebff;
		border-color: #2563ebff;
	}

	.toolbar-button.cancel {
		background-color: #ef4444ff;
		color: #ffffffff;
		border-color: #ef4444ff;
	}

	.toolbar-button.cancel:hover:not(:disabled) {
		background-color: #dc2626ff;
		border-color: #dc2626ff;
	}

	.image-uploader, .rich-text-toolbar {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.image-uploader {
		border-top: 1px solid #e5e7ebff;
	}

	.upload-label {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background-color: #3b82f6ff;
		color: #ffffffff;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.15s;
		text-align: center;
	}

	.upload-label:hover {
		background-color: #2563ebff;
	}

	.upload-label:active {
		transform: scale(0.98);
	}

	.file-input {
		display: none;
	}

	.upload-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.upload-message.error {
		background-color: #fef2f2ff;
		color: #991b1bff;
		border: 1px solid #fecacaff;
	}

	.upload-message.success {
		background-color: #f0fdf4ff;
		color: #166534ff;
		border: 1px solid #bbf7d0ff;
	}

	.upload-info {
		font-size: 0.75rem;
		color: #6b7280ff;
		text-align: center;
		margin: 0;
	}

	.rich-text-toolbar {
		border-top: 1px solid #e5e7ebff;
		flex-direction: row;
	}

	.format-button {
		padding: 0.375rem 0.75rem;
		background-color: #ffffffff;
		border: 1px solid #e5e7ebff;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
		font-size: 1rem;
		min-width: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.format-button:hover {
		background-color: #f9fafbff;
		border-color: #3b82f6ff;
	}

	.format-button:active {
		background-color: #eff6ffff;
		transform: scale(0.98);
	}

	.format-button.code-button {
		font-family: monospace;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.toolbar-divider {
		width: 1px;
		background-color: #e5e7ebff;
		margin: 0.25rem 0;
	}

	.link-input-panel {
		padding: 1rem;
		border-top: 1px solid #e5e7ebff;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.input-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151ff;
	}

	.link-input {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5dbff;
		border-radius: 6px;
		font-size: 0.875rem;
		transition: all 0.15s;
	}

	.link-input:focus {
		outline: none;
		border-color: #3b82f6ff;
		box-shadow: 0 0 0 3px #3b82f61a;
	}

	.link-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.link-button {
		padding: 0.5rem 1rem;
		border: 1px solid #e5e7ebff;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		background-color: #ffffffff;
		color: #374151ff;
	}

	.link-button:hover {
		background-color: #f9fafbff;
		border-color: #d1d5dbff;
	}

	.link-button.primary {
		background-color: #3b82f6ff;
		color: #ffffffff;
		border-color: #3b82f6ff;
	}

	.link-button.primary:hover {
		background-color: #2563ebff;
		border-color: #2563ebff;
	}

	.history-panel {
		border-top: 1px solid #e5e7ebff;
		max-height: 400px;
		display: flex;
		flex-direction: column;
	}

	.history-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid #e5e7ebff;
	}

	.history-header h3 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827ff;
	}

	.history-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280ff;
		border-radius: 4px;
		transition: all 0.15s;
	}

	.history-close:hover {
		background-color: #f3f4f6ff;
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
		padding: 1rem;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow-y: auto;
		flex: 1;
	}

	.history-item {
		padding: 0.75rem;
		background-color: #f9fafbff;
		border-radius: 6px;
		border: 1px solid #e5e7ebff;
		transition: all 0.15s;
	}

	.history-item:hover {
		border-color: #3b82f6ff;
		background-color: #eff6ffff;
	}

	.history-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.history-item time {
		font-size: 0.75rem;
		color: #6b7280ff;
	}

	.restore-button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background-color: #3b82f6ff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 500;
		transition: all 0.15s;
	}

	.restore-button:hover {
		background-color: #2563ebff;
	}

	.history-content {
		font-size: 0.875rem;
		color: #374151ff;
		line-height: 1.5;
	}

	.history-image {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		border: 1px solid #e5e7ebff;
		display: block;
	}
</style>
