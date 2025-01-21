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
    GROUP_CONCAT(DISTINCT u.user_id) as assigned_user_ids,
    GROUP_CONCAT(DISTINCT u.fullname) as assigned_user_names
FROM task_table t
LEFT JOIN users u ON FIND_IN_SET(u.user_id, t.assigned_to)
GROUP BY t.id
ORDER BY t.created_at DESC";
    
    $stmt = $pdo->prepare($query);
    
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }
    
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($tasks as &$task) {
        $userIds = $task['assigned_user_ids'] ? explode(',', $task['assigned_user_ids']) : [];
        $userNames = $task['assigned_user_names'] ? explode(',', $task['assigned_user_names']) : [];
        
        $task['assigned_users'] = array_map(function($id, $name) {
            return ['id' => (int)$id, 'name' => $name];
        }, $userIds, $userNames);
        
        // Remove the concatenated strings
        unset($task['assigned_user_ids']);
        unset($task['assigned_user_names']);
    }
    
    echo json_encode($tasks);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>