# Image Storage Setup Guide

This guide explains how to set up Supabase Storage for your Editify CMS image uploads.

## Prerequisites

- A Supabase project (see [SETUP.md](./SETUP.md))
- Admin access to your Supabase dashboard

## Step 1: Create Storage Bucket

1. Open your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `cms-content`
   - **Public bucket**: ✅ **Enabled** (so images are publicly accessible)
   - **File size limit**: 5MB (or adjust based on your needs)
   - **Allowed MIME types**: Leave empty or specify: `image/jpeg,image/png,image/gif,image/webp`

5. Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies for proper access control.

### Policy 1: Public Read Access

This allows anyone to view uploaded images (necessary for your website visitors).

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-content');
```

**To add this policy:**

1. Go to **Storage** > **Policies** > **cms-content**
2. Click **New Policy**
3. Choose **SELECT** operation
4. Name: `Public Access`
5. Policy definition: `bucket_id = 'cms-content'`
6. Click **Review** and **Save policy**

### Policy 2: Authenticated Upload

This allows authenticated editors to upload images.

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cms-content'
  AND auth.role() = 'authenticated'
);
```

**To add this policy:**

1. Go to **Storage** > **Policies** > **cms-content**
2. Click **New Policy**
3. Choose **INSERT** operation
4. Name: `Authenticated users can upload`
5. Policy definition (under WITH CHECK):
   ```sql
   bucket_id = 'cms-content' AND auth.role() = 'authenticated'
   ```
6. Click **Review** and **Save policy**

### Policy 3: Authenticated Delete (Optional)

This allows editors to delete/replace old images.

```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cms-content'
  AND auth.role() = 'authenticated'
);
```

## Step 3: Test the Setup

1. Log in to your Editify site with an editor account
2. Toggle edit mode on
3. Click on an image element (with `data-cms-type="image"`)
4. Upload a test image
5. Verify the image appears on your page
6. Check the Supabase Storage dashboard to see your uploaded file

## Storage Structure

Images are stored with the following structure:

```
cms-content/
  └── cms-images/
      ├── about.mission.image-1698765432000.jpg
      ├── home.hero.banner-1698765433000.png
      └── portfolio.project1.thumbnail-1698765434000.webp
```

The naming convention is: `{cms-ref}-{timestamp}.{extension}`

## File Size and Type Restrictions

The CMS enforces the following restrictions by default:

- **Max file size**: 5MB
- **Allowed types**: JPG, PNG, GIF, WebP

You can modify these in `/src/lib/cms/CMSOverlay.svelte`:

```typescript
// Validate file size (change maxSize value)
const maxSize = 5 * 1024 * 1024; // 5MB in bytes

// Validate file type (modify the accept attribute)
<input type="file" accept="image/*" />
```

## Troubleshooting

### Images not uploading

- Check that you're logged in as an authenticated user
- Verify the storage bucket exists and is named `cms-content`
- Check the browser console for error messages
- Verify RLS policies are set up correctly

### Images not displaying

- Ensure the bucket is set to **Public**
- Check that the SELECT policy for public access exists
- Verify the image URL in the database is correct

### Permission denied errors

- Confirm you're logged in before trying to upload
- Check that the INSERT policy exists for authenticated users
- Verify your user has the correct role

## Advanced Configuration

### Custom Storage Bucket Name

If you want to use a different bucket name:

1. Update the bucket name in `/src/lib/cms/index.ts`:

```typescript
const { data: uploadData, error: uploadError } = await supabase.storage
	.from('your-bucket-name') // Change here
	.upload(filePath, file, {
		// ...
	});
```

2. Update the getPublicUrl call:

```typescript
const { data: urlData } = supabase.storage
	.from('your-bucket-name') // And here
	.getPublicUrl(filePath);
```

### CDN Integration

For better performance, consider setting up a CDN:

1. Configure a custom domain for your Supabase Storage
2. Update the `getPublicUrl` logic to use your CDN URL
3. See [Supabase CDN Documentation](https://supabase.com/docs/guides/storage/cdn)

## Next Steps

- [Set up editor authentication](./AUTH-SETUP.md)
- [Learn about component usage](./COMPONENT-EXAMPLES.md)
- [Deploy your site](./DEPLOYMENT.md)
