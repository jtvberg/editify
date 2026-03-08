import type { CMSStore, CMSContent } from '$lib/types/cms';

export const load = async ({ locals }: { locals: App.Locals }) => {
	const { session, user } = await locals.safeGetSession();

	const { data: cmsContent, error } = await locals.supabase.from('cms_content').select('*');

	if (error) {
		console.error('Error loading CMS content:', error);
		return {
			session,
			user,
			cmsContent: {} as CMSStore
		};
	}

	const items = (cmsContent as unknown as CMSContent[]) || [];
	const cmsStore = items.reduce<CMSStore>((acc, item) => {
		acc[item.id] = item;
		return acc;
	}, {} as CMSStore);

	return {
		session,
		user,
		cmsContent: cmsStore
	};
};
