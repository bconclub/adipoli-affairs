<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');
require __DIR__ . '/_auth.php';

start_admin_session();
echo json_encode(['authenticated' => !empty($_SESSION['admin'])]);
?>
