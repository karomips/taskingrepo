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

    $status = $data->status;
    $userId = $data->user_id;
    $reason = isset($data->reason) ? $data->reason : null;  // Get reason if provided

    // If reason is provided and status is 'Inactive', you can log it or update it in the database
    if ($status === 'Inactive' && $reason) {
        // Update status and save reason in a separate field (if needed)
        $stmt = $pdo->prepare("
            UPDATE users 
            SET status = :status, inactivity_reason = :reason 
            WHERE user_id = :user_id
        ");
        $stmt->execute([
            ':user_id' => $userId,
            ':status' => $status,
            ':reason' => $reason  // Store the reason
        ]);
    } else {
        // If no reason, just update the status
        $stmt = $pdo->prepare("
            UPDATE users 
            SET status = :status 
            WHERE user_id = :user_id
        ");
        $stmt->execute([
            ':user_id' => $userId,
            ':status' => $status
        ]);
    }

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