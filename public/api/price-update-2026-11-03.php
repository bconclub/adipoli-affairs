<?php
// One-off price update from Thanzeel's 3 Nov messages. Runs once, then locks itself.
header('Content-Type: application/json');
header('Cache-Control: no-store');
ini_set('serialize_precision', '-1'); // write 16.99, not 16.989999999999998

$dataDir = __DIR__ . '/../data';
$menuFile = $dataDir . '/menu.json';
$lockFile = $dataDir . '/.price-update-2026-11-03.done';

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

// Only run on the prices these changes were written against, so nothing gets $2 twice
$check = null;
foreach ($items as $item) {
    if ($item['name'] === 'Masala dosa') $check = $item['price'];
}
if ($check !== 14.99) {
    http_response_code(409);
    echo json_encode(['error' => 'Prices have already changed, nothing was saved']);
    exit;
}

$remove = ['Masala omlet', 'Egg & peas fry'];
$set = ['Gobi 65' => 14.99, 'Chicken 65' => 17.99, 'Beef dry fry (BDF)' => 18.99, 'Kerala prawns fry' => 20.99];
$add = ['South Specials' => 2, 'Combo Specials' => 2, 'Main Course' => 2];

$publicDir = __DIR__ . '/..';
$updated = [];
$changes = [];
foreach ($items as $item) {
    if (in_array($item['name'], $remove, true)) {
        $changes[] = 'removed ' . $item['name'];
        continue;
    }
    $old = $item['price'];
    if (is_numeric($old)) {
        if (isset($set[$item['name']])) {
            $item['price'] = $set[$item['name']];
        } elseif (isset($add[$item['category']])) {
            $item['price'] = round($old + $add[$item['category']], 2);
        } elseif ($item['category'] === 'Biryani') {
            $extra = stripos($item['name'], 'family pack') === 0 ? 3 : 2;
            $item['price'] = round($old + $extra, 2);
        }
        if ($item['price'] !== $old) {
            $changes[] = $item['name'] . ': ' . $old . ' -> ' . $item['price'];
        }
    }
    // Photo saved as .png when only a .jpg exists (the biryani photos)
    $image = isset($item['image']) ? $item['image'] : '';
    if (substr($image, -4) === '.png' && !file_exists($publicDir . urldecode($image))) {
        $jpg = substr($image, 0, -4) . '.jpg';
        if (file_exists($publicDir . urldecode($jpg))) {
            $item['image'] = $jpg;
            $changes[] = $item['name'] . ' photo -> ' . $jpg;
        }
    }
    $updated[] = $item;
}

// Keep the menu as it was before this update
$backupDir = $dataDir . '/backups';
if (is_dir($backupDir) || @mkdir($backupDir, 0775, true)) {
    @copy($menuFile, $backupDir . '/menu-before-price-update-2026-11-03.json');
}

$json = json_encode($updated, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if ($json === false || file_put_contents($menuFile, $json, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save the menu']);
    exit;
}
@file_put_contents($lockFile, date('c'));

echo json_encode(['status' => 'applied', 'dishes' => count($updated), 'changes' => $changes], JSON_PRETTY_PRINT);
?>
