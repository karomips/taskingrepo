<?php
require 'database.php'; // Ensure your database connection is properly included

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get the task_id from the query string
    $taskId = isset($_GET['task_id']) ? $_GET['task_id'] : null;
    if ($taskId === null) {
        throw new Exception("Task ID is required");
    }

    // Query to fetch task files based on task_id (make sure this is task_id from task_files table)
    $query = "
        SELECT tf.id, tf.task_id, tf.filename, tf.filepath, tf.upload_date, tf.accomplishment_report
        FROM task_files tf
        WHERE tf.task_id = :task_id";  // Correct query using task_id

    // Prepare the statement
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':task_id', $taskId, PDO::PARAM_INT);
    
    // Execute the query
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }

    // Fetch the task files
    $taskFiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Debugging: Log the fetched task files
    error_log(print_r($taskFiles, true));  // Log to PHP error log for debugging
    
    // Return the task files as JSON
    echo json_encode($taskFiles);
    
} catch (Exception $e) {
    // If an error occurs, return an error message
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
