<?php
require_once 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (
        isset($input['taskName'], $input['taskDescription'], $input['dueDate'], 
        $input['assignedTo'], $input['createdBy'], $input['taskInstructions'],
        $input['department']) // Add department check
    ) {
        $taskName = $input['taskName'];
        $taskDescription = $input['taskDescription'];
        $taskInstructions = $input['taskInstructions'];
        $dueDate = $input['dueDate'];
        $assignedTo = $input['assignedTo'];
        $createdBy = $input['createdBy'];
        $department = $input['department']; // Add department
        $status = 'Pending';

        // Validate createdBy
        $stmt = $pdo->prepare("SELECT id FROM admin WHERE id = :createdBy");
        $stmt->bindParam(':createdBy', $createdBy);
        $stmt->execute();
        if ($stmt->rowCount() === 0) {
            echo json_encode(['error' => "Invalid createdBy ID: $createdBy. Admin user does not exist."]);
            exit;
        }

        // Validate assignedTo and department match
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE user_id = :assignedTo AND department = :department");
        $stmt->bindParam(':assignedTo', $assignedTo);
        $stmt->bindParam(':department', $department);
        $stmt->execute();
        if ($stmt->rowCount() === 0) {
            echo json_encode(['error' => "Invalid assignedTo ID or department mismatch."]);
            exit;
        }

        // Insert the task
        $stmt = $pdo->prepare("
            INSERT INTO task_table (
                task_name, 
                task_description, 
                task_instructions, 
                due_date, 
                assigned_to, 
                created_by, 
                status,
                department
            ) 
            VALUES (
                :taskName, 
                :taskDescription, 
                :taskInstructions, 
                :dueDate, 
                :assignedTo, 
                :createdBy, 
                :status,
                :department
            )
        ");

        $stmt->bindParam(':taskName', $taskName);
        $stmt->bindParam(':taskDescription', $taskDescription);
        $stmt->bindParam(':taskInstructions', $taskInstructions);
        $stmt->bindParam(':dueDate', $dueDate);
        $stmt->bindParam(':assignedTo', $assignedTo);
        $stmt->bindParam(':createdBy', $createdBy);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':department', $department);

        try {
            $stmt->execute();
            echo json_encode(['success' => true, 'message' => 'Task assigned successfully.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Failed to assign task: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['error' => 'Missing required fields.']);
    }
}
?>