<?php
require 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

try {
    // For debugging
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    
    $query = "SELECT t.*, u.fullname as assigned_to_name, a.admin_username as created_by_name 
              FROM task_table t 
              LEFT JOIN users u ON t.assigned_to = u.user_id 
              LEFT JOIN admin a ON t.created_by = a.id";
    
    if ($userId) {
        $query .= " WHERE t.assigned_to = :user_id";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    } else {
        $stmt = $pdo->prepare($query);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }
    
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check if $tasks is null or empty
    if ($tasks === false) {
        echo json_encode([]);
    } else {
        echo json_encode($tasks);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// For debugging - log any errors to a file
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('JSON encoding error: ' . json_last_error_msg());
}
?>