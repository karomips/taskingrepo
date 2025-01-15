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
    
    $applicantId = isset($_GET['applicant_id']) ? $_GET['applicant_id'] : null;
    
    if (!$applicantId) {
        throw new Exception('Applicant ID is required');
    }
    
    $query = "SELECT d.*, a.last_name, a.first_name 
              FROM applicant_documents d 
              LEFT JOIN applicants a ON d.applicant_id = a.applicant_id 
              WHERE d.applicant_id = :applicant_id 
              ORDER BY d.upload_date DESC";
              
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':applicant_id', $applicantId, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }
    
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($documents === false || empty($documents)) {
        echo json_encode([]);
    } else {
        array_walk($documents, function(&$document) {
            $document['upload_date'] = date('c', strtotime($document['upload_date']));
        });
        
        echo json_encode($documents);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('JSON encoding error: ' . json_last_error_msg());
}