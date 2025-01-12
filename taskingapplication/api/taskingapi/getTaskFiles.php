<?php
require 'database.php'; // Ensure your database connection is properly included

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

error_reporting(E_ALL); // Enable error reporting for debugging
ini_set('display_errors', 1); // Display errors

try {
    // Check if user_id is provided in the query string
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    
    if ($userId === null) {
        throw new Exception("User ID is required");
    }

    // Query to fetch task files for the given user_id, using the task_table to filter by assigned_to
    $query = "
        SELECT tf.id, tf.task_id, tf.filename, tf.filepath, tf.upload_date
        FROM task_files tf
        INNER JOIN task_table t ON tf.task_id = t.id
        WHERE t.assigned_to = :user_id";  // Filter task files based on user_id assigned to the task
    
    // Prepare the statement
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    
    // Execute the query
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }

    // Fetch all task files as an associative array
    $taskFiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // If no task files are found, return an empty array
    if (!$taskFiles) {
        echo json_encode([]);
    } else {
        echo json_encode($taskFiles);  // Return task files as JSON
    }
    
} catch (Exception $e) {
    // Return an error response if an exception occurs
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
