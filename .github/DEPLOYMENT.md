# Deployment Setup Guide

## GitHub Secrets Configuration

To deploy to FTP, you need to set up the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

### Required Secrets:

- **FTP_USERNAME**: `u240474838`
- **FTP_PASSWORD**: `Adipoli#826991`

## How It Works

The workflow will:
1. Trigger on pushes to the `main` branch
2. Build the Next.js application
3. Deploy all necessary files to the FTP server at `82.180.152.35`
4. Upload to `/public_html/` directory

## Manual Deployment

You can also trigger the deployment manually:
1. Go to **Actions** tab in GitHub
2. Select **Deploy to FTP** workflow
3. Click **Run workflow**

## Notes

- The workflow excludes unnecessary files (node_modules, .git, etc.)
- Only production build files are deployed
- Make sure your FTP server supports Node.js if you're using server-side features
- For static sites, consider using `next export` in your build process

