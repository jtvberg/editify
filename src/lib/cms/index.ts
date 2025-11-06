import { writable, derived, get } from 'svelte/store';
import type { CMSContent, CMSStore, RepeatableItem, RepeatableStore, RepeatableComponentType } from '../types/cms';
import { supabase } from '../supabase';

export const editMode = writable(false);
export const cmsStore = writable<CMSStore>({});
export const repeatableStore = writable<RepeatableStore>({});
export const activeElement = writable<{
	ref: string;
	type: string;
	element: HTMLElement;
	usageCount: number;
	x: number;
	y: number;
} | null>(null);

export const isEditor = writable(false);
export function initializeCMS(data: CMSStore) {
	cmsStore.set(data);
}

export function getContent(ref: string): string {
	const store = get(cmsStore);
	return store[ref]?.content || '';
}

export async function saveContent(ref: string, content: string): Promise<boolean> {
	try {
		const { data, error } = await (supabase.from('cms_content') as any)
			.update({
				content,
				updated_at: new Date().toISOString()
			})
			.eq('id', ref)
			.select();

		if (error) {
			console.error('[CMS] Error saving content:', error);
			return false;
		}

		if (!data || data.length === 0) {
			console.warn('[CMS] No rows updated - content ref may not exist:', ref);
			return false;
		}
		
		cmsStore.update((store) => ({
			...store,
			[ref]: {
				...store[ref],
				content,
				updated_at: new Date().toISOString()
			}
		}));

		return true;
	} catch (err) {
		console.error('Error saving content:', err);
		return false;
	}
}

export function subscribeToChanges() {
	const channel = supabase
		.channel('cms-changes')
		.on(
			'postgres_changes',
			{ event: 'UPDATE', schema: 'public', table: 'cms_content' },
			(payload) => {
				const newContent = payload.new as CMSContent;
				cmsStore.update((store) => ({
					...store,
					[newContent.id]: newContent
				}));
			}
		)
		.subscribe();

	return () => {
		channel.unsubscribe();
	};
}

export async function checkEditorRole() {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		isEditor.set(false);
		return false;
	}

	const role = user.user_metadata?.role || user.app_metadata?.role;
	const hasEditorRole = role === 'editor';
	
	isEditor.set(hasEditorRole);
	return hasEditorRole;
}

export async function getContentHistory(ref: string) {
	const { data, error } = await supabase
		.from('cms_content_history')
		.select('*')
		.eq('content_id', ref)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching history:', error);
		return [];
	}

	return data || [];
}

export function countRefUsage(ref: string): number {
	return document.querySelectorAll(`[data-cms-ref="${ref}"]`).length;
}

export async function getAllImages(): Promise<string[]> {
	try {
		const { data, error } = await supabase.storage
			.from('cms-content')
			.list('cms-images', {
				limit: 100,
				offset: 0,
				sortBy: { column: 'created_at', order: 'desc' }
			});

		if (error) {
			console.error('[CMS] Error listing images:', error);
			return [];
		}

		if (!data) {
			return [];
		}

		const imageUrls = data
			.filter(file => {
				const ext = file.name.split('.').pop()?.toLowerCase();
				return ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
			})
			.map(file => {
				const { data: urlData } = supabase.storage
					.from('cms-content')
					.getPublicUrl(`cms-images/${file.name}`);
				return urlData.publicUrl;
			});

		return imageUrls;
	} catch (err) {
		console.error('[CMS] Error in getAllImages:', err);
		return [];
	}
}

export async function uploadImageToStorage(ref: string, file: File): Promise<string | null> {
	try {
		const fileExt = file.name.split('.').pop();
		const fileName = `${ref}-${Date.now()}.${fileExt}`;
		const filePath = `cms-images/${fileName}`;
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('cms-content')
			.upload(filePath, file, {
				cacheControl: '3600',
				upsert: false
			});

		if (uploadError) {
			console.error('[CMS] Error uploading image:', uploadError);
			return null;
		}

		const { data: urlData } = supabase.storage
			.from('cms-content')
			.getPublicUrl(filePath);

		if (!urlData.publicUrl) {
			console.error('[CMS] Error getting public URL');
			return null;
		}

		return urlData.publicUrl;
	} catch (err) {
		console.error('[CMS] Error in uploadImageToStorage:', err);
		return null;
	}
}

export async function uploadImage(ref: string, file: File): Promise<string | null> {
	try {
		const imageUrl = await uploadImageToStorage(ref, file);
		if (!imageUrl) {
			return null;
		}

		const success = await saveContent(ref, imageUrl);
		if (!success) {
			console.error('[CMS] Error saving image URL to database');
			return null;
		}

		return imageUrl;
	} catch (err) {
		console.error('[CMS] Error in uploadImage:', err);
		return null;
	}
}

// ============================================================================
// Repeatable Content Functions (Reference-Based)
// ============================================================================

/**
 * Load repeatable items for a parent ref
 * Items contain references to cms_content - actual content is in cmsStore
 */
export async function loadRepeatableItems(parentRef: string): Promise<RepeatableItem[]> {
	try {
		const { data: items, error } = await (supabase
			.from('content_repeatable') as any)
			.select('*')
			.eq('parent_ref', parentRef)
			.order('position', { ascending: true });

		if (error) {
			console.error('[Repeatable] Error loading items:', error);
			return [];
		}

		if (!items || items.length === 0) {
			repeatableStore.update(store => ({
				...store,
				[parentRef]: []
			}));
			return [];
		}

		const repeatableItems = items as RepeatableItem[];

		// Update store
		repeatableStore.update(store => ({
			...store,
			[parentRef]: repeatableItems
		}));

		return repeatableItems;
	} catch (err) {
		console.error('[Repeatable] Error in loadRepeatableItems:', err);
		return [];
	}
}

/**
 * Add a new repeatable item
 * Database trigger automatically creates cms_content entries
 */
export async function addRepeatableItem(
	parentRef: string,
	componentType: RepeatableComponentType,
	initialData: Record<string, string> = {}
): Promise<RepeatableItem | null> {
	try {
		// Get current items for position
		const currentItems = get(repeatableStore)[parentRef] || [];
		const position = currentItems.length;

		// Insert - trigger creates cms_content entries and populates data with refs
		const { data, error } = await (supabase
			.from('content_repeatable') as any)
			.insert({
				parent_ref: parentRef,
				component_type: componentType,
				position,
				data: {}
			})
			.select()
			.single();

		if (error) {
			console.error('[Repeatable] Error adding item:', error);
			return null;
		}

		const newItem = data as RepeatableItem;

		// If initial content provided, update cms_content entries and cmsStore
		if (componentType === 'Card' && Object.keys(initialData).length > 0) {
			const updates = [];
			const cmsUpdates: Record<string, CMSContent> = {};

			if (initialData.title && newItem.data.title_ref) {
				updates.push(
					(supabase.from('cms_content') as any)
						.update({ content: initialData.title })
						.eq('id', newItem.data.title_ref)
				);
				cmsUpdates[newItem.data.title_ref] = {
					id: newItem.data.title_ref,
					content: initialData.title,
					type: 'text',
					updated_at: new Date().toISOString()
				};
			}
			if (initialData.description && newItem.data.description_ref) {
				updates.push(
					(supabase.from('cms_content') as any)
						.update({ content: initialData.description })
						.eq('id', newItem.data.description_ref)
				);
				cmsUpdates[newItem.data.description_ref] = {
					id: newItem.data.description_ref,
					content: initialData.description,
					type: 'html',
					updated_at: new Date().toISOString()
				};
			}
			if (initialData.image && newItem.data.image_ref) {
				updates.push(
					(supabase.from('cms_content') as any)
						.update({ content: initialData.image })
						.eq('id', newItem.data.image_ref)
				);
				cmsUpdates[newItem.data.image_ref] = {
					id: newItem.data.image_ref,
					content: initialData.image,
					type: 'image',
					updated_at: new Date().toISOString()
				};
			}
			if (initialData.link && newItem.data.link_ref) {
				updates.push(
					(supabase.from('cms_content') as any)
						.update({ content: initialData.link })
						.eq('id', newItem.data.link_ref)
				);
				cmsUpdates[newItem.data.link_ref] = {
					id: newItem.data.link_ref,
					content: initialData.link,
					type: 'text',
					updated_at: new Date().toISOString()
				};
			}

			if (updates.length > 0) {
				await Promise.all(updates);
				cmsStore.update(store => ({ ...store, ...cmsUpdates }));
			}
		}

		// Update repeatableStore
		repeatableStore.update(store => ({
			...store,
			[parentRef]: [...currentItems, newItem]
		}));

		return newItem;
	} catch (err) {
		console.error('[Repeatable] Error in addRepeatableItem:', err);
		return null;
	}
}

/**
 * Remove a repeatable item
 * Database trigger automatically deletes cms_content entries
 */
export async function removeRepeatableItem(itemId: string, parentRef: string): Promise<boolean> {
	try {
		const { error } = await (supabase
			.from('content_repeatable') as any)
			.delete()
			.eq('id', itemId);

		if (error) {
			console.error('[Repeatable] Error removing item:', error);
			return false;
		}

		// Update repeatableStore
		repeatableStore.update(store => ({
			...store,
			[parentRef]: (store[parentRef] || []).filter(item => item.id !== itemId)
		}));

		// Clean up cmsStore (trigger handles DB cleanup)
		const store = get(cmsStore);
		const baseRef = `${parentRef}.${itemId}`;
		const keysToRemove = Object.keys(store).filter(key => key.startsWith(baseRef));
		
		if (keysToRemove.length > 0) {
			cmsStore.update(s => {
				const newStore = { ...s };
				keysToRemove.forEach(key => delete newStore[key]);
				return newStore;
			});
		}

		return true;
	} catch (err) {
		console.error('[Repeatable] Error in removeRepeatableItem:', err);
		return false;
	}
}

/**
 * Reorder a repeatable item
 */
export async function reorderRepeatableItem(
	itemId: string,
	parentRef: string,
	newPosition: number
): Promise<boolean> {
	try {
		const items = get(repeatableStore)[parentRef] || [];
		const oldPosition = items.findIndex(item => item.id === itemId);

		if (oldPosition === -1 || oldPosition === newPosition) {
			return false;
		}

		// Optimistically update UI
		const reordered = [...items];
		const [movedItem] = reordered.splice(oldPosition, 1);
		reordered.splice(newPosition, 0, movedItem);

		repeatableStore.update(store => ({
			...store,
			[parentRef]: reordered.map((item, index) => ({
				...item,
				position: index
			}))
		}));

		// Update database
		const updates = reordered.map((item, index) =>
			(supabase
				.from('content_repeatable') as any)
				.update({ position: index })
				.eq('id', item.id)
		);

		await Promise.all(updates);
		return true;
	} catch (err) {
		console.error('[Repeatable] Error in reorderRepeatableItem:', err);
		// Rollback UI
		await loadRepeatableItems(parentRef);
		return false;
	}
}

