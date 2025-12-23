<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image']) || !isset($_POST['category']) || !isset($_POST['productName'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: image, category, productName']);
    exit;
}

$file = $_FILES['image'];
$category = $_POST['category'];
$productName = $_POST['productName'];

// Validate file
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'File upload error: ' . $file['error']]);
    exit;
}

// Validate file size (max 500KB)
$maxSize = 500 * 1024; // 500KB in bytes
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File size exceeds maximum allowed size of 500KB']);
    exit;
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$fileType = mime_content_type($file['tmp_name']);
if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only images are allowed.']);
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
    if (!mkdir($categoryPath, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create category directory']);
        exit;
    }
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
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

// Return image path
$imagePath = '/images/' . $categoryDir . '/' . $filename;
echo json_encode([
    'success' => true,
    'path' => $imagePath,
    'filename' => $filename
]);
?>

