# CMS Sync Script Authentication

## The Problem

The `cms:sync` script needs to create entries in the `cms_content` table, but your RLS policies only allow users with the `editor` role to insert content. The script runs server-side (Node.js) without a user session.

## Solution: Use Service Role Key

The service role key bypasses RLS policies and is perfect for admin/CLI scripts.

### Step 1: Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **API**
3. Find **service_role** under "Project API keys"
4. Click the eye icon to reveal the key
5. Copy it

⚠️ **Warning:** The service role key has **full database access**. Never expose it client-side or commit it to git!

### Step 2: Add to Environment Variables

Add to your `.env` file:

```bash
# Public keys (safe to expose client-side)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service role key (KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The script will automatically use the service role key if available, falling back to the anon key.

### Step 3: Run Sync

```bash
npm run cms:sync
```

The script now bypasses RLS and can create content entries!

## Alternative: Adjust RLS Policies (Not Recommended)

If you don't want to use the service role key, you could make the INSERT policy public:

```sql
-- Allow anyone to insert (NOT RECOMMENDED for production)
CREATE POLICY "Allow public insert"
ON cms_content FOR INSERT
WITH CHECK (true);
```

**Why not recommended:**

- Opens your database to abuse
- Anyone could create spam entries
- No audit trail of who created what

## Security Best Practices

### ✅ DO:

- Use service role key for CLI scripts and server-side operations
- Keep service role key in `.env` (already in `.gitignore`)
- Use anon key for client-side code
- Rotate keys if they're ever exposed

### ❌ DON'T:

- Commit service role key to git
- Use service role key in browser/client code
- Share service role key publicly
- Weaken RLS policies just for the sync script

## For CI/CD Pipelines

When running `cms:sync` in CI/CD:

### GitHub Actions

```yaml
- name: Sync CMS Content
  env:
    PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  run: npm run cms:sync
```

### Netlify Build

Add environment variables in Netlify dashboard:

- `PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Then in your build command:

```bash
npm run cms:sync && npm run build
```

### Vercel

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## Troubleshooting

### "Missing Supabase credentials"

Make sure your `.env` file has:

- `PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### "Insert permission denied"

- Verify you're using the service role key
- Check the key is correct (it's longer than the anon key)
- Make sure `.env` is in the project root

### "Can't find .env file"

The script uses `dotenv` which looks in the current directory. Make sure you run:

```bash
cd /path/to/your/project
npm run cms:sync
```

## How the Script Works

```javascript
// scripts/cms-sync.js

// Tries service role key first, falls back to anon key
const SUPABASE_SERVICE_KEY =
	process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

// Creates client with elevated permissions
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Now can insert without RLS restrictions
await supabase.from('cms_content').insert({
	id: ref,
	content: '',
	type: 'text'
});
```

## Key Differences

| Key Type         | Purpose            | RLS              | Safe Client-Side? |
| ---------------- | ------------------ | ---------------- | ----------------- |
| **anon**         | Public read access | ✅ Yes           | ✅ Yes            |
| **service_role** | Admin operations   | ❌ No (bypasses) | ❌ **NO!**        |

The service role key is like a master key - powerful but must be protected!
