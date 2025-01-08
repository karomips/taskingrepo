<?php
require 'database.php'; // Make sure your database connection is properly included

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

try {
    // For debugging
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    // Check if user_id is provided in the query string
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    
    // Base query to fetch documents
    $query = "SELECT d.*, u.fullname as uploaded_by_name 
              FROM user_documents d 
              LEFT JOIN users u ON d.user_id = u.user_id";
    
    // If user_id is provided, filter documents by user_id
    if ($userId) {
        $query .= " WHERE d.user_id = :user_id";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    } else {
        $stmt = $pdo->prepare($query);
    }
    
    // Execute the query
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }
    
    // Fetch all documents as an associative array
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check if documents are found
    if ($documents === false || empty($documents)) {
        echo json_encode([]); // Return an empty array if no documents found
    } else {
        echo json_encode($documents); // Return documents as JSON
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
