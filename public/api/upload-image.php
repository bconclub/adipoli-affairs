<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode([
        'error' => 'No file uploaded',
        'debug' => [
            'files' => $_FILES,
            'post' => $_POST,
            'php_upload_max' => ini_get('upload_max_filesize'),
            'php_post_max' => ini_get('post_max_size')
        ]
    ]);
    exit;
}

if (!isset($_POST['category']) || !isset($_POST['productName'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: category, productName']);
    exit;
}

$file = $_FILES['image'];
$category = $_POST['category'];
$productName = $_POST['productName'];

// Check for PHP upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize (' . ini_get('upload_max_filesize') . ')',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive in HTML form',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
    ];
    
    $errorMsg = $errorMessages[$file['error']] ?? 'Unknown upload error: ' . $file['error'];
    
    http_response_code(400);
    echo json_encode([
        'error' => 'File upload error: ' . $errorMsg,
        'debug' => [
            'error_code' => $file['error'],
            'file_size' => $file['size'] ?? 'unknown',
            'file_name' => $file['name'] ?? 'unknown',
            'php_upload_max' => ini_get('upload_max_filesize'),
            'php_post_max' => ini_get('post_max_size'),
            'php_memory_limit' => ini_get('memory_limit')
        ]
    ]);
    exit;
}

// Validate file exists and has size
if (!isset($file['size']) || $file['size'] === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'File is empty or invalid']);
    exit;
}

// Set file size limits (increased to 10MB for all images)
$maxSize = 10 * 1024 * 1024; // 10MB for all images
$fileSizeKB = round($file['size'] / 1024, 2);
$maxSizeMB = '10MB';

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode([
        'error' => "File size ({$fileSizeKB}KB) exceeds maximum allowed size of {$maxSizeMB}",
        'debug' => [
            'file_size_bytes' => $file['size'],
            'file_size_kb' => $fileSizeKB,
            'max_size_bytes' => $maxSize,
            'max_size_mb' => $maxSizeMB
        ]
    ]);
    exit;
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$fileType = mime_content_type($file['tmp_name']);

if ($fileType === false || !in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid file type. Only images are allowed.',
        'debug' => [
            'detected_type' => $fileType,
            'file_name' => $file['name'],
            'allowed_types' => $allowedTypes
        ]
    ]);
    exit;
}

// Sanitize category name
$categoryDir = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $category));
$categoryDir = trim($categoryDir, '-');

// Sanitize product name
$sanitizedName = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $productName));
$sanitizedName = trim($sanitizedName, '-');

// Create category directory if it doesn't exist
$imagesDir = __DIR__ . '/../images';
$categoryPath = $imagesDir . '/' . $categoryDir;

if (!is_dir($categoryPath)) {
    if (!mkdir($categoryPath, 0775, true)) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to create category directory',
            'debug' => [
                'category_path' => $categoryPath,
                'images_dir' => $imagesDir,
                'images_dir_writable' => is_writable($imagesDir)
            ]
        ]);
        exit;
    }
}

// Check if directory is writable
if (!is_writable($categoryPath)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Category directory is not writable',
        'debug' => [
            'category_path' => $categoryPath,
            'permissions' => substr(sprintf('%o', fileperms($categoryPath)), -4)
        ]
    ]);
    exit;
}

// Generate filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
if (empty($extension)) {
    $extension = 'jpg';
}
$filename = $sanitizedName . '.' . $extension;
$filepath = $categoryPath . '/' . $filename;

// Handle file name conflicts
$counter = 1;
while (file_exists($filepath)) {
    $filename = $sanitizedName . '-' . $counter . '.' . $extension;
    $filepath = $categoryPath . '/' . $filename;
    $counter++;
}

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to save file',
        'debug' => [
            'tmp_name' => $file['tmp_name'],
            'destination' => $filepath,
            'tmp_exists' => file_exists($file['tmp_name']),
            'destination_writable' => is_writable($categoryPath)
        ]
    ]);
    exit;
}

// Return image path
$imagePath = '/images/' . $categoryDir . '/' . $filename;
echo json_encode([
    'success' => true,
    'path' => $imagePath,
    'filename' => $filename,
    'size' => $fileSizeKB . 'KB',
    'category' => $categoryDir
]);
?>
