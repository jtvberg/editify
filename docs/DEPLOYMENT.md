# Deployment Guide

This guide covers deploying Editify to Netlify.

## Prerequisites

- A GitHub (or GitLab/Bitbucket) account
- A Netlify account ([sign up free](https://app.netlify.com/signup))
- A configured Supabase project (see [SETUP.md](./SETUP.md))

## Deploying to Netlify

### Step 1: Push to Git Repository

Make sure your project is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the `editify` repository

### Step 3: Configure Build Settings

Netlify will automatically detect your `netlify.toml` configuration, which includes:

- **Build command**: `npm run build`
- **Publish directory**: `.svelte-kit/netlify`
- **Node version**: 20

You should not need to change these settings.

### Step 4: Set Environment Variables

Before deploying, add your Supabase credentials as environment variables:

1. In the Netlify dashboard, go to **Site settings** → **Environment variables**
2. Add the following variables:

   ```
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   You can find these values in your Supabase project settings under **Settings** → **API**.

### Step 5: Deploy

Click **"Deploy site"** and Netlify will:

1. Clone your repository
2. Install dependencies (`npm install`)
3. Run the build command (`npm run build`)
4. Deploy the built site to a Netlify URL

The initial deployment typically takes 2-3 minutes.

## Post-Deployment

### Custom Domain (Optional)

1. In Netlify, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure your DNS

### Continuous Deployment

Netlify automatically sets up continuous deployment:

- Every push to your `main` branch triggers a new deployment
- Pull requests create deploy previews
- You can configure branch-specific deployments in **Site settings** → **Build & deploy**

### Testing Your Deployment

1. Visit your Netlify URL (e.g., `https://your-site-name.netlify.app`)
2. Navigate to `/login` to authenticate
3. Log in with your Supabase credentials
4. Toggle **Edit Mode** to test inline editing

### Troubleshooting

#### Build Fails

- Check the build logs in Netlify dashboard
- Ensure all environment variables are set correctly
- Verify your `package.json` and `netlify.toml` are correct

#### Authentication Issues

- Verify Supabase environment variables are correct
- Add your Netlify URL to Supabase's **Redirect URLs** in **Authentication** → **URL Configuration**
- Format: `https://your-site-name.netlify.app/login`

#### Content Not Updating

- Ensure you've run `npm run cms:sync` to populate the database
- Check Supabase RLS policies are correctly configured
- Verify your user has the `editor` role in Supabase

## Environment Variables Reference

| Variable                   | Required | Description                        |
| -------------------------- | -------- | ---------------------------------- |
| `PUBLIC_SUPABASE_URL`      | Yes      | Your Supabase project URL          |
| `PUBLIC_SUPABASE_ANON_KEY` | Yes      | Your Supabase anonymous/public key |

**Note:** The `SUPABASE_SERVICE_ROLE_KEY` is **not needed** for deployment. It's only used for the `cms:sync` script during development.

## CI/CD with GitHub Actions (Optional)

If you want more control over your deployment pipeline, you can use GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}
```

## Other Deployment Platforms

While this guide focuses on Netlify, you can also deploy to:

- **Vercel**: Change adapter to `@sveltejs/adapter-vercel`
- **Cloudflare Pages**: Change adapter to `@sveltejs/adapter-cloudflare`
- **Node.js server**: Change adapter to `@sveltejs/adapter-node`

See the [SvelteKit adapters documentation](https://kit.svelte.dev/docs/adapters) for more information.

## Support

For deployment issues:

- Check [Netlify documentation](https://docs.netlify.com/)
- Review [SvelteKit deployment docs](https://kit.svelte.dev/docs/adapters)
- Open an issue in the repository
