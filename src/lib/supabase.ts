import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from '$lib/types/database';

// Get environment variables - these will be injected by SvelteKit
const PUBLIC_SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || '';
const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

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
