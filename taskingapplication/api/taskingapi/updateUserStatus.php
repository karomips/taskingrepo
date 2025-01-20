<?php
require_once 'database.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->status)) {
        throw new Exception('Missing required fields');
    }

    $stmt = $pdo->prepare("
        UPDATE users 
        SET status = :status 
        WHERE user_id = :user_id
    ");

    $stmt->execute([
        ':user_id' => $data->user_id,
        ':status' => $data->status
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No changes made']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>