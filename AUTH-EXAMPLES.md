# Authentication Example

Since you need to be logged in as an editor to use the CMS, here are a few options:

## Option 1: Supabase Auth UI (Recommended for Quick Setup)

Install the Supabase Auth UI package:

```bash
npm install @supabase/auth-ui-svelte @supabase/auth-ui-shared
```

Create a login page at `src/routes/login/+page.svelte`:

```svelte
<script lang="ts">
	import { Auth } from '@supabase/auth-ui-svelte';
	import { ThemeSupa } from '@supabase/auth-ui-shared';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect if already logged in
		supabase.auth.onAuthStateChange((event, session) => {
			if (session) {
				goto('/');
			}
		});
	});
</script>

<div class="auth-container">
	<h1>CMS Login</h1>
	<Auth
		supabaseClient={supabase}
		appearance={{ theme: ThemeSupa }}
		providers={[]}
		redirectTo={window.location.origin}
	/>
</div>

<style>
	.auth-container {
		max-width: 400px;
		margin: 4rem auto;
		padding: 2rem;
	}
</style>
```

## Option 2: Custom Login Form

Create `src/routes/login/+page.svelte`:

```svelte
<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		loading = true;
		error = '';

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (signInError) {
			error = signInError.message;
			loading = false;
		} else {
			goto('/');
		}
	}
</script>

<div class="login-container">
	<h1>CMS Login</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleLogin();
		}}
	>
		<div class="form-group">
			<label for="email">Email</label>
			<input id="email" type="email" bind:value={email} required placeholder="editor@example.com" />
		</div>

		<div class="form-group">
			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} required placeholder="••••••••" />
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<button type="submit" disabled={loading}>
			{loading ? 'Logging in...' : 'Log In'}
		</button>
	</form>
</div>

<style>
	.login-container {
		max-width: 400px;
		margin: 4rem auto;
		padding: 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 1rem;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background: #5568d3;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		background: #fee;
		color: #c33;
		padding: 0.75rem;
		border-radius: 6px;
		margin-bottom: 1rem;
	}
</style>
```

## Option 3: Development Mode (Testing Only)

For testing without setting up auth, temporarily modify `src/lib/cms/index.ts`:

```typescript
// TEMPORARY: Force editor mode for testing
export const isEditor = writable(true);

export async function checkEditorRole() {
	isEditor.set(true);
	return true;
}
```

**⚠️ Remove this before deploying to production!**

## Adding Logout

Create a logout button in your layout or header:

```svelte
<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { isEditor } from '$lib/cms';

	async function handleLogout() {
		await supabase.auth.signOut();
		isEditor.set(false);
		goto('/login');
	}
</script>

{#if $isEditor}
	<button onclick={handleLogout}>Logout</button>
{/if}
```

## Auth State Management

Add auth state checking to your layout (`src/routes/+layout.svelte`):

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { checkEditorRole } from '$lib/cms';

	onMount(() => {
		// Check initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (session) {
				checkEditorRole();
			}
		});

		// Listen for auth changes
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN') {
				checkEditorRole();
			} else if (event === 'SIGNED_OUT') {
				// Handle logout
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>
```

## Protected Routes

To protect certain routes, create a `+layout.server.ts`:

```typescript
import { redirect } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/supabase';

export const load = async ({ fetch, url }) => {
	const supabase = createSupabaseServerClient(fetch);

	const {
		data: { session }
	} = await supabase.auth.getSession();

	// Redirect to login if not authenticated and not on login page
	if (!session && url.pathname !== '/login') {
		throw redirect(303, '/login');
	}

	return { session };
};
```

Choose the approach that works best for your needs!
