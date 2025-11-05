import { writable, derived, get } from 'svelte/store';
import type { CMSContent, CMSStore } from '../types/cms';
import { supabase } from '../supabase';

export const editMode = writable(false);
export const cmsStore = writable<CMSStore>({});
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
