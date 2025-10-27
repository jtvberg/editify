# Editify - Lightweight CMS

A minimal, developer-friendly CMS for SvelteKit that maps DOM elements directly to database entries via `data-cms-ref` attributes. Built with SvelteKit, Supabase, and deployed on Netlify.

## 🎯 Core Concept

- **Developers control structure**: Add HTML elements with `data-cms-ref` attributes
- **Editors control content**: Update text, images, and rich content through live edit mode
- **Two-way binding**: DOM and database stay in perfect sync
- **Ref-based architecture**: Same ref = same content everywhere (or unique refs for single-use content)

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Netlify account (for deployment)

### 2. Setup Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Copy your project URL and anon key

### 3. Configure Environment

Create a `.env` file in the project root:

```bash
PUBLIC_SUPABASE_URL=your-project-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Sync Content References

Scan your Svelte files and sync `data-cms-ref` attributes to the database:

```bash
npm run cms:sync
```

### 6. Run Development Server

```bash
npm run dev
```

## 📝 Usage Guide

### Adding Editable Content

Add `data-cms-ref` and `data-cms-type` attributes to any HTML element:

```svelte
<!-- Single-use text -->
<h1 data-cms-ref="home.hero.title" data-cms-type="text">
	{$cmsStore['home.hero.title']?.content || 'Default Title'}
</h1>

<!-- Reusable content (same ref in multiple places) -->
<p data-cms-ref="global.company.tagline" data-cms-type="text">
	{$cmsStore['global.company.tagline']?.content || 'Your trusted partner'}
</p>

<!-- Rich text with HTML -->
<article data-cms-ref="about.intro" data-cms-type="rich-text">
	{@html $cmsStore['about.intro']?.content || '<p>Default content...</p>'}
</article>

<!-- Images (coming soon) -->
<img
	data-cms-ref="home.hero.image"
	data-cms-type="image"
	src={$cmsStore['home.hero.image']?.content || '/default.jpg'}
	alt="Hero"
/>
```

### Content Types

| Type        | Description                 | Use Case                                |
| ----------- | --------------------------- | --------------------------------------- |
| `text`      | Plain text, inline editable | Headlines, labels, short text           |
| `rich-text` | HTML with formatting        | Paragraphs, articles, formatted content |
| `image`     | Image upload (WIP)          | Photos, graphics, media                 |
| `link`      | URL editing (WIP)           | Buttons, navigation                     |

### ID Naming Convention

Use semantic, namespaced IDs:

```
page.section.element
```

Examples:

- `home.hero.title`
- `about.team.description`
- `global.footer.copyright`
- `pricing.cta.button`

### Editing Content

1. **Log in** to Supabase with an account that has `editor` role
2. **Toggle Edit Mode** using the floating button (bottom right)
3. **Click any element** with a `data-cms-ref` to edit
4. **Make changes** directly in place
5. **Click outside** or blur to save automatically

### Setting Up Editor Access

In Supabase, add the `editor` role to user metadata:

1. Go to Authentication → Users
2. Select a user
3. Under "User Metadata", add:
   ```json
   {
   	"role": "editor"
   }
   ```

## 🏗️ Architecture

### Tech Stack

- **SvelteKit**: SSR/SSG framework with reactive stores
- **Supabase**: PostgreSQL database + real-time + auth + storage
- **Netlify**: Hosting and deployment

### Database Schema

```sql
-- Main content table
cms_content:
  - id (TEXT, PRIMARY KEY) -- The data-cms-ref value
  - content (TEXT)
  - type (TEXT: 'text', 'rich-text', 'image', 'link')
  - updated_at (TIMESTAMP)

-- Version history (automatic)
cms_content_history:
  - id (UUID, PRIMARY KEY)
  - content_id (TEXT, foreign key)
  - content (TEXT, snapshot)
  - created_at (TIMESTAMP)
```

### Key Files

```
src/
├── lib/
│   ├── cms/
│   │   ├── index.ts              # Core CMS stores and functions
│   │   ├── CMSContent.svelte     # Wrapper component (optional)
│   │   ├── EditModeToggle.svelte # Edit mode button
│   │   └── CMSOverlay.svelte     # Editing toolbar
│   ├── types/
│   │   ├── cms.ts                # TypeScript types
│   │   └── database.ts           # Supabase types
│   └── supabase.ts               # Supabase client
├── routes/
│   ├── +layout.svelte            # CMS initialization
│   ├── +layout.server.ts         # Load CMS content
│   └── +page.svelte              # Your pages with cms refs
scripts/
└── cms-sync.js                   # CLI sync tool
supabase-schema.sql               # Database schema
```

### Stores

```typescript
import { editMode, cmsStore, isEditor } from '$lib/cms';

// Toggle edit mode
$editMode = true;

// Access content
$cmsStore['home.hero.title']?.content;

// Check editor status
$isEditor;
```

### Functions

```typescript
import {
	initializeCMS, // Initialize store with data
	saveContent, // Save content to database
	subscribeToChanges, // Real-time updates
	checkEditorRole, // Check if user is editor
	getContentHistory, // Get version history
	countRefUsage // Count ref occurrences
} from '$lib/cms';
```

## 🔧 Development Workflow

### 1. Add Content References

```svelte
<h1 data-cms-ref="pricing.hero.headline" data-cms-type="text">
	{$cmsStore['pricing.hero.headline']?.content || 'Our Pricing Plans'}
</h1>
```

### 2. Sync to Database

```bash
npm run cms:sync
```

This command:

- Scans all `.svelte` files in `src/`
- Extracts `data-cms-ref` attributes
- Creates missing database entries
- Reports on reused refs

### 3. Edit Content

- Log in as an editor
- Enable Edit Mode
- Click and edit content
- Changes save automatically

### 4. Deploy

```bash
npm run build
```

Deploy to Netlify (or any SvelteKit-compatible host).

## 🌐 Deployment

### Netlify

1. Connect your Git repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add environment variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

### Other Platforms

This project uses `@sveltejs/adapter-auto`, which automatically detects your deployment platform. For specific platforms, you may need to change adapters:

- Vercel: `@sveltejs/adapter-vercel`
- Cloudflare Pages: `@sveltejs/adapter-cloudflare`
- Node: `@sveltejs/adapter-node`

## 🔐 Security

### Row Level Security (RLS)

The schema includes RLS policies:

```sql
-- Everyone can read
CREATE POLICY "Everyone can read content"
ON cms_content FOR SELECT USING (true);

-- Only editors can update
CREATE POLICY "Editors can update content"
ON cms_content FOR UPDATE
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'editor');
```

### Authentication

Uses Supabase Auth with role-based access:

- Unauthenticated users: Read-only access
- Authenticated users with `editor` role: Can edit content

## 📚 Examples

### Reusable Content

Use the same ref in multiple places to share content:

```svelte
<!-- Header -->
<span data-cms-ref="global.company.tagline" data-cms-type="text">
	{$cmsStore['global.company.tagline']?.content}
</span>

<!-- Footer -->
<p data-cms-ref="global.company.tagline" data-cms-type="text">
	{$cmsStore['global.company.tagline']?.content}
</p>
```

Edit once, updates everywhere! The CMS will show "Used in 2 places" indicator.

### Rich Text Content

```svelte
<article data-cms-ref="blog.post.content" data-cms-type="rich-text">
	{@html $cmsStore['blog.post.content']?.content || '<p>Loading...</p>'}
</article>
```

Supports bold, italic, links, and basic HTML formatting.

## 🚧 Roadmap (Future Enhancements)

- [ ] Image upload and management
- [ ] Link editing with preview
- [ ] Collections (repeating items like blog posts)
- [ ] Drag-and-drop reordering
- [ ] Content scheduling
- [ ] Multi-language support
- [ ] Search and filter content
- [ ] Bulk operations
- [ ] Export/import functionality

## 🤝 Contributing

This is a test bed project for the lightweight CMS architecture. Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT

## 🙏 Credits

Built with:

- [SvelteKit](https://kit.svelte.dev/)
- [Supabase](https://supabase.com/)
- [Netlify](https://netlify.com/)

---

**Happy Editing! ✨**
