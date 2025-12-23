# API Endpoints

This directory contains PHP endpoints for managing menu data and image uploads.

## Setup

Make sure the following directories are writable (chmod 777):

1. `/public/images/` - For storing uploaded images
2. `/public/data/` - For storing JSON data files (menu.json, featured.json)

### Setting Permissions

```bash
chmod 777 public/images
chmod 777 public/data
```

Or via FTP/file manager, set permissions to 777 for both directories.

## Endpoints

### Image Upload
- **POST** `/api/upload-image.php`
  - Uploads and saves images to `/public/images/[category]/[sanitized-name].jpg`
  - Parameters: `image` (file), `category` (string), `productName` (string)
  - Returns: JSON with `success`, `path`, and `filename`

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

