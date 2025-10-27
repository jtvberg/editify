# Authentication & Editor Setup

## Setting Up Editor Access

For users to edit content, they need the `editor` role in their Supabase user metadata.

### Method 1: SQL (Recommended)

Run this in your Supabase SQL Editor:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "editor"}'::jsonb
WHERE email = 'editor@example.com';
```

Replace `editor@example.com` with the actual user's email.

### Method 2: Supabase Dashboard

1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click on the user you want to make an editor
3. Scroll to **Raw User Meta Data**
4. Add or merge this JSON:
   ```json
   {
   	"role": "editor"
   }
   ```
5. Click **Save**

**Note:** Users need to log out and log back in for the role change to take effect.

## CMS Sync Script Authentication

The `cms:sync` script needs to create entries in the database, but RLS policies prevent unauthorized inserts.

### Solution: Service Role Key

The service role key bypasses RLS policies and is perfect for admin/CLI scripts.

#### Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **API**
3. Find **service_role** under "Project API keys"
4. Click the eye icon to reveal the key
5. Copy it

⚠️ **Warning:** The service role key has **full database access**. Never expose it client-side or commit it to git!

#### Add to Environment Variables

Add to your `.env` file:

```bash
# Public keys (safe to expose client-side)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service role key (KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The sync script automatically uses the service role key when available.

#### Run Sync

```bash
npm run cms:sync
```

The script now bypasses RLS and can create content entries!

## Implementing User Authentication

Since you need to be logged in as an editor to use the CMS, here are authentication options:

### Option 1: Supabase Auth UI (Quickest)

Install the package:

```bash
npm install @supabase/auth-ui-svelte @supabase/auth-ui-shared
```

Create `src/routes/login/+page.svelte`:

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

### Option 2: Custom Login Form

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

	{#if error}
		<div class="error">{error}</div>
	{/if}

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
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	button:hover:not(:disabled) {
		background: #2563eb;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error {
		padding: 0.75rem;
		margin-bottom: 1rem;
		background: #fee;
		color: #c00;
		border-radius: 4px;
	}
</style>
```

### Option 3: Magic Link Login

Create `src/routes/login/+page.svelte`:

```svelte
<script lang="ts">
	import { supabase } from '$lib/supabase';

	let email = $state('');
	let sent = $state(false);
	let error = $state('');
	let loading = $state(false);

	async function handleMagicLink() {
		loading = true;
		error = '';

		const { error: sendError } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: window.location.origin
			}
		});

		if (sendError) {
			error = sendError.message;
		} else {
			sent = true;
		}
		loading = false;
	}
</script>

<div class="login-container">
	<h1>CMS Login</h1>

	{#if sent}
		<div class="success">
			Check your email! We sent you a magic link to {email}
		</div>
	{:else}
		{#if error}
			<div class="error">{error}</div>
		{/if}

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleMagicLink();
			}}
		>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					placeholder="editor@example.com"
				/>
			</div>

			<button type="submit" disabled={loading}>
				{loading ? 'Sending...' : 'Send Magic Link'}
			</button>
		</form>
	{/if}
</div>

<style>
	/* Same styles as Option 2 */
	.success {
		padding: 0.75rem;
		background: #efe;
		color: #060;
		border-radius: 4px;
	}
</style>
```

## Protecting Routes

Add authentication checks to your layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import { initializeCMS, subscribeToChanges, checkEditorRole } from '$lib/cms';
	import { EditModeToggle, CMSOverlay } from '$lib';

	// ... existing CMS initialization code ...

	onMount(async () => {
		// Check auth state
		const {
			data: { session }
		} = await supabase.auth.getSession();

		// Redirect to login if not authenticated (except on login page)
		if (!session && $page.url.pathname !== '/login') {
			goto('/login');
		}

		// Check editor role
		if (session) {
			await checkEditorRole();
		}
	});
</script>

<!-- Your layout content -->
```

## Testing Editor Access

1. Create a user in Supabase (Authentication → Users → Add User)
2. Grant them the editor role using SQL or dashboard method above
3. Log in with that user
4. You should see the **Edit Mode** button appear
5. Toggle edit mode and click on any element with `data-cms-ref` to edit

## Troubleshooting

**Edit Mode button doesn't appear:**

- Check that user has `{ "role": "editor" }` in raw_user_meta_data
- User needs to log out and back in after role is added
- Check browser console for errors

**Can't save edits:**

- Verify RLS policies are set up correctly (run `sql/supabase-rls-policies.sql`)
- Check that the `is_editor()` function exists in your database
- Look for 403 errors in browser console

**Sync script fails:**

- Ensure `SUPABASE_SERVICE_ROLE_KEY` is in your `.env` file
- Verify the service role key is correct (copy from Supabase dashboard)
- Check that database tables exist
