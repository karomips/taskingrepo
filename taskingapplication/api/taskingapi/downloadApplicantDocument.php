<?php

require 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

try {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    $documentId = isset($_GET['document_id']) ? $_GET['document_id'] : null;
    
    if (!$documentId) {
        throw new Exception('Document ID is required');
    }
    
    $query = "SELECT filename, filepath FROM applicant_documents WHERE document_id = :document_id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':document_id', $documentId, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception("Query execution failed");
    }
    
    $document = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$document) {
        throw new Exception('Document not found');
    }
    
    $filePath = $document['filepath'];
    
    if (!file_exists($filePath)) {
        throw new Exception('File not found on server');
    }
    
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($document['filename']) . '"');
    header('Content-Length: ' . filesize($filePath));
    
    readfile($filePath);
    exit;
    
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
}