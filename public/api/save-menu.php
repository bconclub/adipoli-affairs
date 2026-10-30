<?php
header('Content-Type: application/json');
require __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_admin();

$data = json_decode(file_get_contents('php://input'), true);

if ($data === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

if (!isset($data['items']) || !is_array($data['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid items array']);
    exit;
}

// Create data directory if it doesn't exist
$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    if (!mkdir($dataDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create data directory']);
        exit;
    }
}

$filepath = $dataDir . '/menu.json';

// Never let a bad save wipe the menu
if (count($data['items']) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Refusing to save an empty menu']);
    exit;
}

// Keep the last 30 versions so a mistake can be undone
$backupDir = $dataDir . '/backups';
if (file_exists($filepath) && (is_dir($backupDir) || @mkdir($backupDir, 0775, true))) {
    @copy($filepath, $backupDir . '/menu-' . date('Ymd-His') . '.json');
    $backups = glob($backupDir . '/menu-*.json') ?: [];
    sort($backups);
    foreach (array_slice($backups, 0, max(0, count($backups) - 30)) as $old) {
        @unlink($old);
    }
}

// Save to file
$json = json_encode($data['items'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if (file_put_contents($filepath, $json) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save menu data']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Menu saved successfully',
    'count' => count($data['items'])
]);
?>

