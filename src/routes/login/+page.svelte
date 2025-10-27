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