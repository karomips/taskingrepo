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
    
    // Updated query to include department and position
    $query = "SELECT 
        applicant_id,
        last_name,
        first_name,
        middle_name,
        suffix,
        contact_number,
        email,
        date_of_birth,
        place_of_birth,
        nationality,
        civil_status,
        gender,
        department,
        position,
        created_at,
        status
    FROM applicants 
    ORDER BY created_at DESC";
    
    $stmt = $pdo->prepare($query);
    
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }
    
    $applicants = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($applicants === false || empty($applicants)) {
        echo json_encode([]);
    } else {
        // Format dates for frontend
        array_walk($applicants, function(&$applicant) {
            $applicant['date_of_birth'] = date('Y-m-d', strtotime($applicant['date_of_birth']));
            $applicant['created_at'] = date('c', strtotime($applicant['created_at']));
        });
        
        echo json_encode($applicants);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>