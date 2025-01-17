<?php
// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Check if origin is from localhost
    if (preg_match('/^http:\/\/localhost(:\d+)?$/', $origin)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Access-Control-Allow-Methods: PUT, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 3600");
    }
    exit(0);
}

require 'database.php';

// For actual requests, handle CORS the same way
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if origin is from localhost
if (preg_match('/^http:\/\/localhost(:\d+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Methods: PUT, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Credentials: true");
}

header('Content-Type: application/json');

// Rest of your existing code remains the same
try {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['applicant_id']) || !isset($data['status'])) {
        throw new Exception("Required fields are missing");
    }
    
    $allowedStatuses = ['Approved', 'Rejected'];
    if (!in_array($data['status'], $allowedStatuses)) {
        throw new Exception("Invalid status value");
    }

    $pdo->beginTransaction();
    
    // Update applicant status
    $updateQuery = "UPDATE applicants SET status = :status WHERE applicant_id = :applicant_id";
    $updateStmt = $pdo->prepare($updateQuery);
    
    $params = [
        ':applicant_id' => $data['applicant_id'],
        ':status' => $data['status']
    ];
    
    if (!$updateStmt->execute($params)) {
        throw new Exception("Failed to update applicant status");
    }
    
    // If status is 'Approved', insert into users table
    if ($data['status'] === 'Approved') {
        $getApplicantQuery = "SELECT * FROM applicants WHERE applicant_id = :applicant_id";
        $getApplicantStmt = $pdo->prepare($getApplicantQuery);
        $getApplicantStmt->execute([':applicant_id' => $data['applicant_id']]);
        $applicant = $getApplicantStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$applicant) {
            throw new Exception("Applicant not found");
        }
        
        // Updated INSERT query to include department and position
        $insertQuery = "INSERT INTO users (
            fullname,
            email,
            password,
            contact_number,
            date_of_birth,
            place_of_birth,
            nationality,
            civil_status,
            gender,
            department,
            position
        ) VALUES (
            :fullname,
            :email,
            :password,
            :contact_number,
            :date_of_birth,
            :place_of_birth,
            :nationality,
            :civil_status,
            :gender,
            :department,
            :position
        )";
        
        $insertStmt = $pdo->prepare($insertQuery);
        
        // Construct fullname
        $fullname = trim($applicant['first_name'] . ' ' . 
                        ($applicant['middle_name'] ? $applicant['middle_name'] . ' ' : '') . 
                        $applicant['last_name'] . ' ' .
                        ($applicant['suffix'] ? $applicant['suffix'] : ''));
        
        // Updated parameters to include department and position
        $insertParams = [
            ':fullname' => $fullname,
            ':email' => $applicant['email'],
            ':password' => password_hash('123456', PASSWORD_DEFAULT),
            ':contact_number' => $applicant['contact_number'],
            ':date_of_birth' => $applicant['date_of_birth'],
            ':place_of_birth' => $applicant['place_of_birth'],
            ':nationality' => $applicant['nationality'],
            ':civil_status' => $applicant['civil_status'],
            ':gender' => $applicant['gender'],
            ':department' => $applicant['department'],
            ':position' => $applicant['position']
        ];
        
        if (!$insertStmt->execute($insertParams)) {
            throw new Exception("Failed to create user account");
        }
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Applicant status updated successfully' . 
                    ($data['status'] === 'Approved' ? ' and user account created' : '')
    ]);
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>