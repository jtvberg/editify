import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';

export const supabase = createBrowserClient<Database>(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY
);

export function createSupabaseServerClient(fetch: typeof globalThis.fetch) {
	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		},
		cookies: {
			getAll() {
				return [];
			},
			setAll() {}
		}
	});
}
