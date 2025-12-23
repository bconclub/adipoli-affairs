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

## Troubleshooting

### Files not appearing in public_html

If the deployment shows as complete but files aren't visible:

1. **Check the GitHub Actions logs**: 
   - Go to Actions tab → Click on the latest workflow run
   - Check the "Deploy to FTP" step logs
   - Look for "Uploading" messages to see what files are being uploaded

2. **Verify FTP directory path**:
   - The workflow uses `./public_html/` as the server directory
   - Your FTP server might use a different path like:
     - `/public_html/`
     - `/domains/yourdomain.com/public_html/`
     - `/htdocs/`
     - `/www/`
   
3. **Update server-dir in workflow**:
   - Edit `.github/workflows/deploy.yml`
   - Change `server-dir: ./public_html/` to your actual FTP directory path
   - Common paths:
     - `server-dir: /public_html/` (absolute path)
     - `server-dir: /domains/yourdomain.com/public_html/` (domain-specific)
     - `server-dir: /htdocs/` (alternative)

4. **Check FTP root directory**:
   - Log into your FTP server manually
   - Note the exact path where you see `public_html` or `www` folder
   - Use that exact path in the workflow

5. **Verify files were uploaded**:
   - Check the verbose logs in GitHub Actions
   - Look for "✓ Uploaded" messages
   - Count how many files were uploaded

### Next.js Requirements

For Next.js to work on your server, you need:
- Node.js installed (version 18 or higher)
- Run `npm install --production` on the server
- Run `npm start` or use a process manager like PM2
- Or configure your hosting to auto-start the Next.js server

If your hosting doesn't support Node.js, you'll need to:
- Use a static export (requires removing API routes)
- Or use a different hosting solution that supports Node.js

