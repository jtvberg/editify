import { createSupabaseServerClient } from '$lib/supabase';
import type { CMSStore, CMSContent } from '$lib/types/cms';

export const load = async ({ fetch }: { fetch: typeof globalThis.fetch }) => {
	const supabase = createSupabaseServerClient(fetch);

	// Fetch all CMS content
	const { data: cmsContent, error } = await supabase.from('cms_content').select('*');

	if (error) {
		console.error('Error loading CMS content:', error);
		return {
			cmsContent: {} as CMSStore
		};
	}

	// Transform array to object keyed by id
	const items = (cmsContent as unknown as CMSContent[]) || [];
	const cmsStore = items.reduce<CMSStore>((acc, item) => {
		acc[item.id] = item;
		return acc;
	}, {} as CMSStore);

	return {
		cmsContent: cmsStore
	};
};
