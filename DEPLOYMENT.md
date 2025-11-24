# Deployment Guide for Google Cloud Build

This guide helps you set up Google Cloud Build for deploying FlameCV.

## Prerequisites

1. Google Cloud Project with Cloud Build API enabled
2. Cloud Storage bucket (for static hosting) OR App Engine configured
3. Environment variables set in Cloud Build

## Setup Steps

### 1. Configure Environment Variables in Cloud Build

You need to set these as substitution variables in your Cloud Build trigger:

1. Go to **Cloud Build** → **Triggers** in Google Cloud Console
2. Edit your trigger
3. Go to **Substitution variables** section
4. Add these variables:
   - `_GEMINI_API_KEY`: Your Gemini API key
   - `_VITE_SUPABASE_URL`: Your Supabase project URL
   - `_VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `_BUCKET_NAME`: Your Cloud Storage bucket name (if using static hosting)

**OR** set them as Secret Manager secrets (recommended for production):

```bash
# Create secrets
gcloud secrets create gemini-api-key --data-file=- <<< "your-gemini-key"
gcloud secrets create supabase-url --data-file=- <<< "your-supabase-url"
gcloud secrets create supabase-anon-key --data-file=- <<< "your-supabase-anon-key"

# Grant Cloud Build access
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Then update `cloudbuild.yaml` to use secrets instead of substitutions.

### 2. Update cloudbuild.yaml

Edit `cloudbuild.yaml` and replace:
- `_BUCKET_NAME`: Your actual Cloud Storage bucket name
- Or remove the gsutil step if using App Engine/Cloud Run

### 3. For App Engine Deployment

If deploying to App Engine, create an `app.yaml` file:

```yaml
runtime: nodejs20

handlers:
  - url: /
    static_files: dist/index.html
    upload: dist/index.html
  - url: /(.*)
    static_files: dist/\1
    upload: dist/(.*)
```

Then update `cloudbuild.yaml` to deploy to App Engine instead of Cloud Storage.

### 4. Common Build Errors

**Error: Environment variables not found**
- Make sure all substitution variables are set in your Cloud Build trigger
- Check that variable names match exactly (case-sensitive)

**Error: Build timeout**
- Increase timeout in Cloud Build settings
- Or use a higher machine type (already set to E2_HIGHCPU_8)

**Error: npm ci fails**
- Make sure `package-lock.json` is committed to git
- Check that all dependencies are listed in `package.json`

**Error: Build succeeds but deployment fails**
- Check bucket permissions
- Verify bucket name is correct
- Ensure Cloud Build service account has Storage Admin role

### 5. Grant Permissions

Make sure Cloud Build service account has necessary permissions:

```bash
# For Cloud Storage
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/storage.admin"

# For App Engine (if using)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/appengine.deployer"
```

## Testing the Build Locally

You can test the build configuration locally:

```bash
# Install Cloud Build local builder
gcloud components install cloud-build-local

# Run build locally
cloud-build-local --config=cloudbuild.yaml --dryrun=false
```

## Troubleshooting

Check Cloud Build logs in the Google Cloud Console for specific error messages. Common issues:

1. **Missing environment variables**: Set them in trigger substitutions
2. **Build timeout**: Increase timeout or use faster machine type
3. **Permission errors**: Grant necessary IAM roles to Cloud Build service account
4. **npm errors**: Ensure package-lock.json is committed

