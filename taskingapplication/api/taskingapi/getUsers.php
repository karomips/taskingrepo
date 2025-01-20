<?php
require_once 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("
        SELECT 
            user_id,
            fullname,
            email,
            contact_number,
            date_of_birth,
            place_of_birth,
            nationality,
            civil_status,
            gender,
            department,
            position,
            profile_picture,
            created_at,
            status
        FROM users
    ");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($users);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Failed to fetch users: ' . $e->getMessage()]);
}
?>