# API Endpoints

This directory contains PHP endpoints for managing menu data and image uploads.

## Setup

### 1. Directory Permissions

Make sure the following directories are writable (chmod 775 or 777):

1. `/public/images/` - For storing uploaded images
2. `/public/data/` - For storing JSON data files (menu.json, featured.json)

```bash
chmod 775 public/images
chmod 775 public/data
```

Or via FTP/file manager, set permissions to 775 (or 777) for both directories.

### 2. PHP Configuration

The upload endpoint accepts images up to **10MB**. Ensure your PHP configuration allows this:

**Required PHP settings (in php.ini or .htaccess):**
```ini
upload_max_filesize = 10M
post_max_size = 10M
memory_limit = 128M
max_execution_time = 300
max_input_time = 300
```

**Note:** The `.htaccess` file in this directory attempts to set these values, but some servers may not allow this. If uploads fail, check your server's `php.ini` file or contact your hosting provider.

**To check current PHP settings:**
Create a temporary `phpinfo.php` file:
```php
<?php phpinfo(); ?>
```
Visit it in your browser to see current PHP configuration.

## Endpoints

### Image Upload
- **POST** `/api/upload-image.php`
  - Uploads and saves images to `/public/images/[category]/[sanitized-name].jpg`
  - **Max file size:** 10MB (for all images, including featured items)
  - Parameters: `image` (file), `category` (string), `productName` (string)
  - Returns: JSON with `success`, `path`, `filename`, `size`, and `category`
  - **Error responses include debug information** to help troubleshoot upload issues

### Menu Data
- **GET** `/api/get-menu.php` - Retrieves menu items from `menu.json`
- **POST** `/api/save-menu.php` - Saves menu items to `menu.json`
  - Body: `{ "items": [...] }`

### Featured Items
- **GET** `/api/get-featured.php` - Retrieves featured items from `featured.json`
- **POST** `/api/save-featured.php` - Saves featured items to `featured.json`
  - Body: `{ "items": [...] }`

## File Structure

```
public/
├── api/
│   ├── upload-image.php
│   ├── get-menu.php
│   ├── save-menu.php
│   ├── get-featured.php
│   └── save-featured.php
├── images/
│   ├── [category]/
│   │   └── [sanitized-name].jpg
│   └── featured/
│       └── [sanitized-name].jpg
└── data/
    ├── menu.json
    └── featured.json
```

