<?php
require_once 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the input data from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    if (
        isset($input['taskName'], $input['taskDescription'], $input['dueDate'], 
              $input['assignedTo'], $input['createdBy'])
    ) {
        // Assign the input values to variables
        $taskName = $input['taskName'];
        $taskDescription = $input['taskDescription'];
        $dueDate = $input['dueDate'];
        $status = "Pending"; // Default status
        $assignedTo = $input['assignedTo'];
        $createdBy = $input['createdBy'];

        try {
            // Insert the task into the task_table
            $stmt = $pdo->prepare("INSERT INTO task_table (task_name, task_description, due_date, status, assigned_to, created_by) 
                                   VALUES (:taskName, :taskDescription, :dueDate, :status, :assignedTo, :createdBy)");

            $stmt->bindParam(':taskName', $taskName);
            $stmt->bindParam(':taskDescription', $taskDescription);
            $stmt->bindParam(':dueDate', $dueDate);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':assignedTo', $assignedTo);
            $stmt->bindParam(':createdBy', $createdBy);

            // Execute the statement
            if ($stmt->execute()) {
                // Return success response
                echo json_encode([
                    'success' => true,
                    'message' => 'Task assigned successfully.'
                ]);
            } else {
                // Return error response
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to assign task.'
                ]);
            }
        } catch (PDOException $e) {
            // Return error response with the exception message
            echo json_encode([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ]);
        }
    } else {
        // Return error response for missing fields
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields.'
        ]);
    }
} else {
    // Return error response for unsupported request method
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method. Only POST is allowed.'
    ]);
}
