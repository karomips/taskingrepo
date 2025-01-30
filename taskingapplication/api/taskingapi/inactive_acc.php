<?php
require_once 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);
    $user_id = $data['user_id'] ?? null;
    $inactivity_reason = $data['inactivity_reason'] ?? null;

    if (!$user_id || !$inactivity_reason) {
        echo json_encode(['error' => 'User ID and inactivity reason are required']);
        exit;
    }

    // Fetch user data
    $stmt = $pdo->prepare("SELECT * FROM users WHERE user_id = :user_id");
    $stmt->execute(['user_id' => $user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Insert into inactive_acc
    $insertStmt = $pdo->prepare("
        INSERT INTO inactive_acc (
            user_id, fullname, email, contact_number, date_of_birth, place_of_birth, 
            nationality, civil_status, gender, department, position, profile_picture, 
            created_at, status, inactivity_reason
        ) VALUES (
            :user_id, :fullname, :email, :contact_number, :date_of_birth, :place_of_birth, 
            :nationality, :civil_status, :gender, :department, :position, :profile_picture, 
            :created_at, 'Inactive', :inactivity_reason
        )
    ");

    $insertStmt->execute([
        'user_id' => $user['user_id'],
        'fullname' => $user['fullname'],
        'email' => $user['email'],
        'contact_number' => $user['contact_number'],
        'date_of_birth' => $user['date_of_birth'],
        'place_of_birth' => $user['place_of_birth'],
        'nationality' => $user['nationality'],
        'civil_status' => $user['civil_status'],
        'gender' => $user['gender'],
        'department' => $user['department'],
        'position' => $user['position'],
        'profile_picture' => $user['profile_picture'],
        'created_at' => $user['created_at'],
        'inactivity_reason' => $inactivity_reason
    ]);

    // Check if row was inserted
    if ($insertStmt->rowCount() === 0) {
        echo json_encode(['error' => 'Failed to insert into inactive_acc']);
        exit;
    }

    // Delete from users table
    $deleteStmt = $pdo->prepare("DELETE FROM users WHERE user_id = :user_id");
    $deleteStmt->execute(['user_id' => $user_id]);

    echo json_encode(['success' => true, 'message' => 'User moved to inactive accounts']);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Failed to transfer user: ' . $e->getMessage()]);
}
?>
