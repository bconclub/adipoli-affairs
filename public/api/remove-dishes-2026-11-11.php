<?php
// One-off removal of two dishes Thanzeel asked to drop on 11 Nov. Runs once, then locks itself.
header('Content-Type: application/json');
header('Cache-Control: no-store');
ini_set('serialize_precision', '-1');

$dataDir = __DIR__ . '/../data';
$menuFile = $dataDir . '/menu.json';
$lockFile = $dataDir . '/.remove-dishes-2026-11-11.done';

if (file_exists($lockFile)) {
    echo json_encode(['status' => 'already applied']);
    exit;
}

$items = json_decode(@file_get_contents($menuFile), true);
if (!is_array($items) || count($items) === 0) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not read the menu']);
    exit;
}

$remove = ['lamb kothu porotta', 'fruit salad + ice cream'];
$updated = [];
$removed = [];
foreach ($items as $item) {
    if (in_array(strtolower(trim($item['name'])), $remove, true)) {
        $removed[] = $item['name'];
        continue;
    }
    $updated[] = $item;
}

if (count($removed) === 0) {
    echo json_encode(['status' => 'nothing to remove']);
    exit;
}

$backupDir = $dataDir . '/backups';
if (is_dir($backupDir) || @mkdir($backupDir, 0775, true)) {
    @copy($menuFile, $backupDir . '/menu-before-remove-dishes-2026-11-11.json');
}

$json = json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($menuFile, $json, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save the menu']);
    exit;
}
@file_put_contents($lockFile, date('c'));

echo json_encode(['status' => 'applied', 'removed' => $removed, 'dishes' => count($updated)]);
?>
