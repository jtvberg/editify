# Editify - Lightweight CMS Test Bed

A minimal, developer-friendly CMS for SvelteKit that uses `data-cms-ref` attributes to map DOM elements directly to database entries. Built with SvelteKit, Supabase, and designed for Netlify deployment.

## 🎯 What is This?

This project serves as a **test bed** for a lightweight CMS architecture where:

- **Developers control structure** - Add HTML elements with `data-cms-ref` attributes
- **Editors control content** - Update text, images, and rich content through inline editing
- **Two-way binding** - DOM and database stay in perfect sync
- **Ref-based architecture** - Same ref = same content everywhere

## 🚀 Quick Start

1. **Set up Supabase**

   ```bash
   # Create a Supabase project at https://supabase.com
   # Run the SQL from supabase-schema.sql in your SQL Editor
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

4. **Run Development Server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:5173](http://localhost:5173) to see it in action!

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions
- **[CMS-README.md](./CMS-README.md)** - Full CMS documentation
- **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** - Command and pattern reference
- **[COMPONENT-EXAMPLES.md](./COMPONENT-EXAMPLES.md)** - Usage examples
- **[AUTH-EXAMPLES.md](./AUTH-EXAMPLES.md)** - Authentication setup options
- **[CMS-SYNC-AUTH.md](./CMS-SYNC-AUTH.md)** - How to authenticate the sync script
- **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)** - What's been built

## ✨ Features

- ✅ Inline content editing
- ✅ Real-time synchronization
- ✅ Content versioning
- ✅ Role-based access control
- ✅ Reusable content refs
- ✅ Text and rich-text support
- ✅ TypeScript support
- ✅ Server-side rendering
- ✅ CLI sync tool

## 📝 Basic Usage

Add editable content to your Svelte components:

```svelte
<script>
	import { cmsStore } from '$lib/cms';
</script>

<h1 data-cms-ref="home.hero.title" data-cms-type="text">
	{$cmsStore['home.hero.title']?.content || 'Welcome!'}
</h1>
```

Sync to database:

```bash
npm run cms:sync
```

Edit as an authenticated editor with the floating Edit Mode button!

## 🏗️ Architecture

### Tech Stack

- **SvelteKit** - SSR/SSG framework
- **Supabase** - PostgreSQL + real-time + auth
- **Netlify** - Hosting (recommended)

### Key Concepts

- `data-cms-ref` attributes identify editable elements
- Reactive Svelte stores provide real-time updates
- Supabase RLS handles security
- CLI tool syncs refs to database

## 🔐 Authentication

To edit content, users need the `editor` role in Supabase user metadata:

```json
{
	"role": "editor"
}
```

See [AUTH-EXAMPLES.md](./AUTH-EXAMPLES.md) for implementation options.

## 🛠️ Commands

```bash
npm run dev          # Start development server
npm run cms:sync     # Sync content refs to database
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Type checking
```

## 📦 What's Included

- Full CMS implementation with stores and components
- Database schema with RLS policies
- CLI sync tool for content refs
- Example pages with editable content
- Complete TypeScript support
- Comprehensive documentation

## 🎯 Use Cases

This CMS architecture is perfect for:

- Marketing sites with occasional content updates
- Small business websites
- Portfolios and blogs
- Landing pages
- Any site where developers control layout but editors need content control

## 🚧 Roadmap

Future enhancements (not in V1):

- Image upload and management
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
