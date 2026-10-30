<?php
// Admin login shared by the protected endpoints. Only the salted hash lives here.
const ADMIN_PASSWORD_SALT = '04ff7903245532843c2c1ca8b7eb73f1';
const ADMIN_PASSWORD_HASH = '59e907553ce5c40fae0c6ff4df6c108692e8c199b1e3e06c2aac1460ac5dfce4';
const ADMIN_PASSWORD_ITERATIONS = 100000;
const ADMIN_SESSION_SECONDS = 604800; // 7 days

ini_set('display_errors', '0');

function start_admin_session() {
    // Default session folders get cleaned early on shared hosting, so keep ours outside public_html
    $dir = dirname(__DIR__, 2) . '/adipoli-sessions';
    if (@is_dir($dir) || @mkdir($dir, 0700, true)) {
        session_save_path($dir);
    }
    ini_set('session.gc_maxlifetime', (string) ADMIN_SESSION_SECONDS);
    session_name('adipoli_admin');
    session_set_cookie_params([
        'lifetime' => ADMIN_SESSION_SECONDS,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function is_admin_password($password) {
    $hash = hash_pbkdf2('sha256', (string) $password, ADMIN_PASSWORD_SALT, ADMIN_PASSWORD_ITERATIONS, 64);
    return hash_equals(ADMIN_PASSWORD_HASH, $hash);
}

function require_admin() {
    start_admin_session();
    if (empty($_SESSION['admin'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Please log in again']);
        exit;
    }
    session_write_close();
}
?>
