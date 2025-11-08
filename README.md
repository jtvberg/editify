# Editify - Lightweight CMS with Repeatable Content

A minimal, developer-friendly CMS for SvelteKit with inline editing and a flexible repeatable content system. Built with SvelteKit, Supabase, and Svelte 5.

## 🎯 What is This?

This project serves as a **production-ready CMS** where:

- **Developers control structure** - Add HTML elements with `data-cms-ref` attributes
- **Editors control content** - Update text, HTML, and images through inline editing
- **Repeatable content** - Cards, carousels, sections with nested tags
- **Two-way binding** - DOM and database stay in perfect sync
- **Ref-based architecture** - Same ref = same content everywhere, history and cancel work automatically

## 🚀 Quick Start

1. **Set up Supabase**

   ```bash
   # Create a Supabase project at https://supabase.com
   # Run these SQL files in order in your SQL Editor:
   # 1. sql/supabase-schema.sql (base CMS tables)
   # 2. sql/repeatable-content.sql (repeatable content system)
   # 3. sql/supabase-rls-policies.sql (CMS permissions)
   # 4. sql/repeatable-rls-policies.sql (repeatable permissions)
   # Or use: npm run db:reset (after configuring environment)
   ```

2. **Configure Environment**

   ```bash
   cp .env.example .env
   # Add your Supabase URL, anon key, and service role key to .env
   ```

3. **Install & Sync**

   ```bash
   npm install
   npm run db:reset    # Reset database to current schema (optional if you ran SQL manually)
   npm run cms:sync    # Sync CMS refs from your components to database
   ```

4. **Set up an Editor User**

   Run this SQL in Supabase to grant editor access to a user:

   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"role": "editor"}'::jsonb
   WHERE email = 'your-editor@email.com';
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:5173](http://localhost:5173) and log in to see inline editing in action!

## 📚 Documentation

- **[docs/SETUP.md](./docs/SETUP.md)** - Complete step-by-step setup instructions
- **[docs/REPEATABLE-CONTENT.md](./docs/REPEATABLE-CONTENT.md)** - Repeatable content architecture (Cards, Tags, etc.)
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deploying to Netlify (and other platforms)
- **[docs/QUICK-REFERENCE.md](./docs/QUICK-REFERENCE.md)** - Commands and patterns cheat sheet
- **[docs/COMPONENT-EXAMPLES.md](./docs/COMPONENT-EXAMPLES.md)** - Usage examples and patterns
- **[docs/AUTH-SETUP.md](./docs/AUTH-SETUP.md)** - Authentication and editor role setup
- **[docs/CURRENT-STATE.md](./docs/CURRENT-STATE.md)** - Current implementation state and architecture decisions

## ✨ Features

### Core CMS

- ✅ Inline content editing with Svelte 5 actions
- ✅ Real-time synchronization via Supabase
- ✅ Content versioning and history
- ✅ Role-based access control (editor role)
- ✅ Reusable content refs
- ✅ Text, HTML, and image content support
- ✅ Image uploads with Supabase Storage
- ✅ Image library browser for existing images
- ✅ Image object-fit control (fill, contain, cover, none)
- ✅ Metadata storage for extensibility
- ✅ CLI sync tool

### Repeatable Content

- ✅ Cards, Carousels, Sections components
- ✅ Nested repeatables (tags within cards)
- ✅ Reference-based architecture (no content duplication)
- ✅ Database triggers for auto-create/delete
- ✅ History and cancel work automatically
- ✅ Add, remove, reorder controls
- ✅ Extensible component system

### Developer Experience

- ✅ TypeScript support
- ✅ Server-side rendering (SSR)
- ✅ Hot module replacement
- ✅ Simple, maintainable code

## 📝 Basic Usage

### Inline Editable Content

Add editable content to your Svelte components using the `use:cms` action:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<h1 data-cms-ref="home.hero.title" data-cms-type="text" use:cms>
	{$cmsStore['home.hero.title']?.content || 'Welcome!'}
</h1>
```

### Repeatable Content

Add repeatable sections (cards, carousels, etc.):

```svelte
<script>
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';
</script>

<RepeatableContainer ref="portfolio.projects" type="Card" containerClass="project-grid" />
```

Each card automatically includes nested tags. The system handles:

- Auto-creating cms_content entries
- Add/remove/reorder controls (in edit mode)
- History and cancel functionality
- All CRUD operations

Sync refs to database:

```bash
npm run cms:sync
```

Log in as an authenticated editor and use the floating **Edit Mode** button to start editing!

## 🏗️ Architecture

### Tech Stack

- **SvelteKit 2** with **Svelte 5** - Modern SSR framework with runes and actions
- **Supabase** - PostgreSQL + real-time subscriptions + auth
- **@supabase/ssr** - SSR-compatible Supabase client

### Key Concepts

- `data-cms-ref` attributes identify editable elements
- `use:cms` Svelte action makes elements editable in edit mode
- Reactive Svelte stores provide real-time updates
- Supabase RLS (Row Level Security) handles permissions
- CLI tool syncs refs to database using service role key

## 🔐 Authentication

To edit content, users need the `editor` role in their Supabase user metadata:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "editor"}'::jsonb
WHERE email = 'editor@example.com';
```

See [docs/AUTH-SETUP.md](./docs/AUTH-SETUP.md) for authentication implementation options.

## 🛠️ Commands

```bash
npm run dev          # Start development server
npm run cms:sync     # Sync content refs to database
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Type checking
```

## 🚀 Deployment to Netlify

This project is configured for easy deployment to Netlify:

1. **Push to GitHub** (or your preferred Git provider)

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

3. **Configure Environment Variables**

   In Netlify's site settings, add these environment variables:

   ```
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**

   Netlify will automatically detect the `netlify.toml` configuration and deploy your site!

**Note:** The build command and publish directory are already configured in `netlify.toml`. The adapter will automatically handle serverless functions for server-side routes.

## 🎯 Use Cases

This CMS architecture is perfect for:

- Marketing sites with occasional content updates
- Small business websites
- Portfolios and blogs
- Landing pages
- Any site where developers control layout but editors need content control

## 🤝 Contributing

This is a test bed project. Feel free to fork, experiment, and adapt to your needs!

## 📄 License

MIT

---

Built with [SvelteKit](https://kit.svelte.dev/) and [Supabase](https://supabase.com/)
