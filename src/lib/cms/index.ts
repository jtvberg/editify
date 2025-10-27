import { writable, derived, get } from 'svelte/store';
import type { CMSContent, CMSStore } from '../types/cms';
import { supabase } from '../supabase';

// Edit mode toggle
export const editMode = writable(false);

// CMS content store
export const cmsStore = writable<CMSStore>({});

// Active element being edited
export const activeElement = writable<{
	ref: string;
	type: string;
	element: HTMLElement;
	usageCount: number;
	x: number;
	y: number;
} | null>(null);

// Check if user is an editor
export const isEditor = writable(false);

// Initialize CMS store with data
export function initializeCMS(data: CMSStore) {
	cmsStore.set(data);
}

// Get content for a specific ref
export function getContent(ref: string): string {
	const store = get(cmsStore);
	return store[ref]?.content || '';
}

// Save content to database
export async function saveContent(ref: string, content: string): Promise<boolean> {
	try {
		console.log('[CMS saveContent] Attempting to save:', { ref, content });
		
		// Check current user and session
		const { data: { user } } = await supabase.auth.getUser();
		console.log('[CMS saveContent] Current user:', user?.email, 'metadata:', user?.user_metadata);
		
		// Type assertion needed due to Supabase type inference limitations
		const { data, error } = await (supabase.from('cms_content') as any)
			.update({
				content,
				updated_at: new Date().toISOString()
			})
			.eq('id', ref)
			.select();

		if (error) {
			console.error('[CMS saveContent] Error saving content:', error);
			return false;
		}

		console.log('[CMS saveContent] Save response:', { data, rowsAffected: data?.length });
		
		if (!data || data.length === 0) {
			console.warn('[CMS saveContent] No rows updated - row may not exist with id:', ref);
			// Let's check if the row exists
			const { data: checkData } = await supabase.from('cms_content').select('id').eq('id', ref);
			console.log('[CMS saveContent] Row exists check:', checkData);
			return false;
		}
		
		console.log('[CMS saveContent] Save successful, updating local store');
		
		// Update local store
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

// Subscribe to real-time updates
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

// Check if user has editor role
export async function checkEditorRole() {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		isEditor.set(false);
		return false;
	}

	// Check for editor role in user metadata or JWT claims
	const role = user.user_metadata?.role || user.app_metadata?.role;
	const hasEditorRole = role === 'editor';
	
	isEditor.set(hasEditorRole);
	return hasEditorRole;
}

// Get content history
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

// Count usage of a ref across the DOM
export function countRefUsage(ref: string): number {
	return document.querySelectorAll(`[data-cms-ref="${ref}"]`).length;
}
