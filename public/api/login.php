<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');
require __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$password = is_array($data) && isset($data['password']) ? $data['password'] : '';

if (!is_string($password) || !is_admin_password($password)) {
    sleep(1); // Slow down password guessing
    http_response_code(401);
    echo json_encode(['error' => 'Incorrect password']);
    exit;
}

start_admin_session();
session_regenerate_id(true);
$_SESSION['admin'] = true;
echo json_encode(['success' => true]);
?>
