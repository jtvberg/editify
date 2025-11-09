<script lang="ts">
	import { cmsStore, cms } from '$lib';
</script>

<footer class="footer">
    <p data-cms-ref="global.footer.copyright" data-cms-type="text" use:cms>
        {$cmsStore['global.footer.copyright']?.content || '© 2025 Editify. Built with SvelteKit/Supabase/Vite.'}
    </p>
	<a href="/login" class="nav-link login-link">Login</a>
</footer>

<style>
	.footer {
		text-align: center;
		padding: 3rem 0;
		margin-top: 4rem;
	}

	.footer p {
		color: var(--cms-placeholder-text);
	}

	.login-link {
		color: var(--color-text-secondary);
	}

	.login-link:hover {
		color: var(--color-text-primary);
	}
</style>
