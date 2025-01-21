<?php
// getMessages.php
require 'database.php';

// Enable error reporting and logging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Get and validate parameters
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    $admin_id = isset($_GET['admin_id']) ? intval($_GET['admin_id']) : null;

    // Log received parameters
    error_log("Received parameters - user_id: $user_id, admin_id: $admin_id");

    // Validate parameters
    if (!$user_id || !$admin_id) {
        throw new Exception('Missing or invalid parameters');
    }

    // Prepare and execute query
    $query = "SELECT m.*, 
                     a.admin_username,
                     u.fullname as user_fullname
              FROM messages m
              LEFT JOIN admin a ON m.admin_id = a.id
              LEFT JOIN users u ON m.user_id = u.user_id
              WHERE (m.user_id = ? AND m.admin_id = ?)
                 OR (m.user_id = ? AND m.admin_id = ?)
              ORDER BY m.sent_at ASC";

    $stmt = $pdo->prepare($query);
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . json_encode($pdo->errorInfo()));
    }

    $stmt->execute([$user_id, $admin_id, $admin_id, $user_id]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'messages' => $messages
    ]);

} catch (Exception $e) {
    error_log("Error in getMessages.php: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => [
            'user_id' => $user_id ?? null,
            'admin_id' => $admin_id ?? null
        ]
    ]);
}
?>