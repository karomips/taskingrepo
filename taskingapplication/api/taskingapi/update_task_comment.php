<?php
require 'database.php'; // Make sure to include your database connection

// Allow CORS and specific methods
header("Access-Control-Allow-Origin: http://localhost:57175"); // Allow specific origin (localhost:4200 for Angular)
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS"); // Allow specific methods, including PUT
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept"); // Allow specific headers
header('Content-Type: application/json');

// Handle OPTIONS request (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Respond with OK for preflight
    exit();
}

try {
    // For debugging
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    // Get the raw PUT data
    $inputData = json_decode(file_get_contents('php://input'), true);

    $taskId = isset($inputData['task_id']) ? $inputData['task_id'] : null;
    $adminId = isset($inputData['admin_id']) ? $inputData['admin_id'] : null;  // Admin ID
    $adminComment = isset($inputData['admin_comment']) ? $inputData['admin_comment'] : null;

    if (!$taskId || !$adminId || !$adminComment) {
        // If task_id, admin_id, or admin_comment are missing, return an error
        throw new Exception("Invalid data: task_id, admin_id, and admin_comment are required.");
    }

    // Prepare the insert query to add a comment into the task_comments table
    $insertQuery = "INSERT INTO task_comments (task_id, admin_id, comment, created_at) 
                    VALUES (:task_id, :admin_id, :admin_comment, NOW())";
    $stmt = $pdo->prepare($insertQuery);
    $stmt->bindParam(':task_id', $taskId, PDO::PARAM_INT);
    $stmt->bindParam(':admin_id', $adminId, PDO::PARAM_INT);
    $stmt->bindParam(':admin_comment', $adminComment, PDO::PARAM_STR);

    // Execute the query
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Admin comment added successfully.']);
    } else {
        throw new Exception("Failed to add admin comment.");
    }

} catch (Exception $e) {
    http_response_code(500); // Server error
    echo json_encode(['error' => $e->getMessage()]);
}
?>
