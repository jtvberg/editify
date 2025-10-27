# Editify - Lightweight CMS Test Bed

A minimal, developer-friendly CMS for SvelteKit that uses `data-cms-ref` attributes to map DOM elements directly to database entries. Built with SvelteKit, Supabase, and the new Svelte 5 action system for inline editing.

## 🎯 What is This?

This project serves as a **test bed** for a lightweight CMS architecture where:

- **Developers control structure** - Add HTML elements with `data-cms-ref` attributes
- **Editors control content** - Update text and rich content through inline editing
- **Two-way binding** - DOM and database stay in perfect sync via Svelte actions
- **Ref-based architecture** - Same ref = same content everywhere

## 🚀 Quick Start

1. **Set up Supabase**

   ```bash
   # Create a Supabase project at https://supabase.com
   # Run sql/supabase-schema.sql in your SQL Editor
   # Then run sql/supabase-rls-policies.sql to set up permissions
   ```

2. **Configure Environment**

   ```bash
   cp .env.example .env
   # Add your Supabase URL, anon key, and service role key to .env
   ```

3. **Install & Sync**

   ```bash
   npm install
   npm run cms:sync  # Requires SUPABASE_SERVICE_ROLE_KEY in .env
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
- **[docs/QUICK-REFERENCE.md](./docs/QUICK-REFERENCE.md)** - Commands and patterns cheat sheet
- **[docs/COMPONENT-EXAMPLES.md](./docs/COMPONENT-EXAMPLES.md)** - Usage examples and patterns
- **[docs/AUTH-SETUP.md](./docs/AUTH-SETUP.md)** - Authentication and editor role setup

## ✨ Features

- ✅ Inline content editing with Svelte 5 actions
- ✅ Real-time synchronization via Supabase
- ✅ Content versioning and history
- ✅ Role-based access control (editor role)
- ✅ Reusable content refs
- ✅ Text and rich-text support
- ✅ TypeScript support
- ✅ Server-side rendering (SSR)
- ✅ CLI sync tool

## 📝 Basic Usage

Add editable content to your Svelte components using the `use:cms` action:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<h1 data-cms-ref="home.hero.title" data-cms-type="text" use:cms>
	{$cmsStore['home.hero.title']?.content || 'Welcome!'}
</h1>
```

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

## 🎯 Use Cases

This CMS architecture is perfect for:

- Marketing sites with occasional content updates
- Small business websites
- Portfolios and blogs
- Landing pages
- Any site where developers control layout but editors need content control

## 🚧 Current Limitations

This is a test bed / V1 implementation. Not yet implemented:

- Image upload and management
- Link/URL editing
- Collections (repeating content blocks)
- Drag-and-drop reordering
- Content scheduling
- Multi-language support

## 🤝 Contributing

This is a test bed project. Feel free to fork, experiment, and adapt to your needs!

## 📄 License

MIT

---

Built with [SvelteKit](https://kit.svelte.dev/), [Supabase](https://supabase.com/), and ❤️
