# Complete Setup Guide

Follow these steps to get your CMS up and running from scratch.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `editify-cms` (or your choice)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `sql/supabase-schema.sql` from this project
4. Paste into the query editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success - you should see:
   - ✅ 2 tables created (`cms_content`, `cms_content_history`)
   - ✅ RLS enabled on both tables
   - ✅ Triggers created for history and timestamps

## Step 3: Set Up RLS Policies

1. In Supabase SQL Editor, click **New Query**
2. Copy the entire contents of `sql/supabase-rls-policies.sql`
3. Paste and click **Run**
4. This creates:
   - ✅ `is_editor()` security definer function
   - ✅ Read policy (everyone can read)
   - ✅ Update policy (editors only)
   - ✅ Insert policy (editors only)
   - ✅ History insert policy (system)

## Step 4: Get API Keys

1. In Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click to reveal)
     - ⚠️ **Keep this secret!** Never commit it to git or expose it client-side

## Step 4: Configure Environment

1. In your project root, create a `.env` file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:

   ```bash
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   **Important:**
   - `PUBLIC_SUPABASE_ANON_KEY` - Used by the website (safe to expose)
   - `SUPABASE_SERVICE_ROLE_KEY` - Used by `cms:sync` script (must stay secret!)
   - The `.env` file is already in `.gitignore` to keep secrets safe

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Sync Content References

This scans your Svelte files and creates database entries for all `data-cms-ref` attributes:

```bash
npm run cms:sync
```

**Note:** The sync script uses the service role key to bypass RLS policies and create content entries.

You should see output like:

```
🚀 CMS Sync Tool

🔍 Scanning Svelte files for CMS refs...

✅ Created: home.hero.title
   Type: text
   File: src/routes/+page.svelte
   Content: "Welcome to Editify"

✅ Created: home.hero.subtitle
   Type: text
   File: src/routes/+page.svelte

...

📈 Summary:
   ✅ Created: 15
   ⏭️  Already exists: 0
   ❌ Errors: 0
   📦 Total refs: 15
```

## Step 7: Create Editor User

### Create the User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**

### Add Editor Role (Choose ONE method)

**Method A: Using SQL (Recommended - Quick & Reliable)**

Go to **SQL Editor** and run:

```sql
-- Replace with your user's email
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "editor"}'::jsonb
WHERE email = 'your-email@example.com';
```

**Method B: Using Supabase UI**

1. Go to **Authentication** → **Users**
2. Click on the user you just created
3. Scroll down to **Raw User Meta Data** section
4. Click **Edit**
5. Add or merge this JSON:
   ```json
   {
   	"role": "editor"
   }
   ```
6. Click **Save**

### Verify It Worked

Run this SQL query:

```sql
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'your-email@example.com';
```

You should see `editor` in the role column.

## Step 8: Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 9: Test Editing

1. Open your site in the browser
2. **Log in** using the email/password you created in Step 7
   - You may need to add a login page, or use Supabase Auth UI
   - For quick testing, you can temporarily modify the code to set `isEditor` to `true`
3. Look for the **Edit Mode** button (bottom right corner)
4. Click it to enable editing
5. Click any text with a blue dashed outline
6. Edit the content
7. Click outside to save

Changes are saved automatically to Supabase!

## Step 10: Deploy to Netlify

1. Push your code to GitHub:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. Go to [netlify.com](https://netlify.com) and login
3. Click **Add new site** → **Import an existing project**
4. Choose **GitHub** and authorize
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
7. Add environment variables:
   - `PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `PUBLIC_SUPABASE_ANON_KEY`: Your anon key
8. Click **Deploy site**

Your CMS is now live! 🎉

## Troubleshooting

### "Module not found" errors

Run:

```bash
npm install
npm run prepare
```

### Sync tool shows "No CMS refs found"

Make sure you have `data-cms-ref` attributes in your `.svelte` files:

```svelte
<h1 data-cms-ref="test.title" data-cms-type="text">
	{$cmsStore['test.title']?.content || 'Test'}
</h1>
```

### Edit Mode button doesn't appear

1. Check that you're logged in to Supabase
2. Verify user has `role: "editor"` in user metadata
3. Open browser console and check for errors

### Changes don't save

1. Check browser console for errors
2. Verify RLS policies are set up correctly in Supabase
3. Make sure your user has the editor role
4. Check that `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are correct

### Real-time updates not working

1. In Supabase dashboard, go to **Database** → **Replication**
2. Make sure `cms_content` table has replication enabled
3. Check browser console for WebSocket errors

## Next Steps

- Add more content refs to your pages
- Customize the styling of edit mode overlays
- **[Set up image uploads with Supabase Storage](./IMAGE-STORAGE-SETUP.md)**
- Add more pages with editable content
- Invite team members as editors

## Need Help?

- Check the [Image Storage Setup Guide](./IMAGE-STORAGE-SETUP.md) for configuring image uploads
- Review the example implementation in `src/routes/+page.svelte`
- Check the full documentation in `CMS-README.md`
- Open an issue on GitHub
