<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$filepath = __DIR__ . '/../data/menu.json';

if (!file_exists($filepath)) {
    // Return empty array if file doesn't exist
    echo json_encode([]);
    exit;
}

$content = file_get_contents($filepath);
if ($content === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read menu data']);
    exit;
}

$data = json_decode($content, true);
if ($data === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

echo json_encode($data);
?>











