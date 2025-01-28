<?php
require 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

try {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    // Check if user_id is provided in the request
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    
    $query = "SELECT 
        t.id,
        t.task_name,
        t.task_description,
        t.task_instructions,
        t.due_date,
        t.status,
        t.department,
        t.created_by,
        t.created_at,
        t.updated_at,
        t.progress,
        t.file_attachment,
        u.user_id as assigned_user_id,
        u.fullname as assigned_user_name
    FROM task_table t
    LEFT JOIN users u ON FIND_IN_SET(u.user_id, t.assigned_to)";
    
    // Add WHERE clause if user_id is provided
    if ($userId) {
        $query .= " WHERE FIND_IN_SET(:user_id, t.assigned_to)";
    }
    
    $query .= " ORDER BY t.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    
    // Bind parameter if user_id is provided
    if ($userId) {
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }
    
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $formattedTasks = [];
    foreach ($tasks as $task) {
        $taskId = $task['id'];
        if (!isset($formattedTasks[$taskId])) {
            $formattedTasks[$taskId] = [
                'id' => $task['id'],
                'task_name' => $task['task_name'],
                'task_description' => $task['task_description'],
                'task_instructions' => $task['task_instructions'],
                'due_date' => $task['due_date'],
                'status' => $task['status'],
                'department' => $task['department'],
                'created_by' => $task['created_by'],
                'created_at' => $task['created_at'],
                'updated_at' => $task['updated_at'],
                'progress' => $task['progress'],
                'file_attachment' => $task['file_attachment'],
                'assigned_users' => []
            ];
        }
        
        if ($task['assigned_user_id']) {
            $formattedTasks[$taskId]['assigned_users'][] = [
                'id' => $task['assigned_user_id'],
                'name' => $task['assigned_user_name']
            ];
        }
    }
    
    echo json_encode(array_values($formattedTasks));
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>