<?php
require_once 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

try {
    // Modify the SQL query to select the profile_picture and department fields
    $stmt = $pdo->prepare("SELECT user_id, fullname, profile_picture, department FROM users");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return the users as a JSON response
    echo json_encode($users);
} catch (PDOException $e) {
    // If an error occurs, return a JSON error message
    echo json_encode(['error' => 'Failed to fetch users: ' . $e->getMessage()]);
}
?>
