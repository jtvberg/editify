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
		// Type assertion needed due to Supabase type inference limitations
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

// Get all uploaded images from Supabase Storage
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

		// Get public URLs for all images
		const imageUrls = data
			.filter(file => {
				// Filter only image files
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

// Upload image to Supabase Storage
export async function uploadImage(ref: string, file: File): Promise<string | null> {
	try {
		// Generate unique filename with timestamp
		const fileExt = file.name.split('.').pop();
		const fileName = `${ref}-${Date.now()}.${fileExt}`;
		const filePath = `cms-images/${fileName}`;

		// Upload to Supabase Storage
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

		// Get public URL
		const { data: urlData } = supabase.storage
			.from('cms-content')
			.getPublicUrl(filePath);

		if (!urlData.publicUrl) {
			console.error('[CMS] Error getting public URL');
			return null;
		}

		// Save the URL to the CMS content
		const success = await saveContent(ref, urlData.publicUrl);
		if (!success) {
			console.error('[CMS] Error saving image URL to database');
			return null;
		}

		return urlData.publicUrl;
	} catch (err) {
		console.error('[CMS] Error in uploadImage:', err);
		return null;
	}
}
