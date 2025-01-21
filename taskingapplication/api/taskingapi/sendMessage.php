<?php
require 'database.php'; // Assuming this contains PDO connection setup

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

// For debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    // Get JSON input
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // Validate input data
    if (!$data || !isset($data['admin_id']) || !isset($data['user_id']) || !isset($data['message_content'])) {
        throw new Exception('Missing required fields');
    }

    // Sanitize and validate inputs
    $admin_id = filter_var($data['admin_id'], FILTER_VALIDATE_INT);
    $user_id = filter_var($data['user_id'], FILTER_VALIDATE_INT);
    $message_content = trim($data['message_content']);
    $current_datetime = date('Y-m-d H:i:s');

    if ($admin_id === false || $user_id === false) {
        throw new Exception('Invalid admin_id or user_id');
    }

    if (empty($message_content)) {
        throw new Exception('Message content cannot be empty');
    }

    // Prepare SQL statement using PDO
    $query = "INSERT INTO messages (admin_id, user_id, message_content, sent_at, is_read) 
              VALUES (:admin_id, :user_id, :message_content, :sent_at, 0)";
    
    $stmt = $pdo->prepare($query);
    
    // Bind parameters
    $params = [
        ':admin_id' => $admin_id,
        ':user_id' => $user_id,
        ':message_content' => $message_content,
        ':sent_at' => $current_datetime
    ];

    // Execute the statement
    if (!$stmt->execute($params)) {
        throw new Exception("Failed to execute query");
    }

    // Check if the message was inserted
    if ($stmt->rowCount() > 0) {
        $message_id = $pdo->lastInsertId();
        
        $response = [
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => [
                'message_id' => $message_id,
                'admin_id' => $admin_id,
                'user_id' => $user_id,
                'sent_at' => $current_datetime,
                'is_read' => false
            ]
        ];
        echo json_encode($response);
    } else {
        throw new Exception('Failed to insert message');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// For debugging - log any JSON encoding errors
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('JSON encoding error: ' . json_last_error_msg());
}
?>