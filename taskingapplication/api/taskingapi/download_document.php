<?php
require 'database.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

try {
    if (!isset($_GET['document_id'])) {
        throw new Exception('Document ID is required');
    }

    $documentId = intval($_GET['document_id']);
    
    // Get document information from database
    $stmt = $pdo->prepare("SELECT ad.document_id, ad.filepath, ad.filename, ad.document_type, a.applicant_id 
                          FROM applicant_documents ad
                          JOIN applicants a ON ad.applicant_id = a.applicant_id
                          WHERE ad.document_id = :document_id");
    $stmt->bindParam(':document_id', $documentId, PDO::PARAM_INT);
    $stmt->execute();
    $document = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$document) {
        throw new Exception("Document not found");
    }

    // Construct the correct file path
    $baseUploadPath = $_SERVER['DOCUMENT_ROOT'] . '/4ward/eoportal/eoportalapi/uploads/documents/' . $document['applicant_id'] . '/';
    $filePath = $baseUploadPath . basename($document['filepath']);
    
    if (!file_exists($filePath)) {
        error_log("File not found at: " . $filePath);
        throw new Exception("File not found");
    }

    // Get file mime type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $filePath);
    finfo_close($finfo);

    // Set appropriate headers
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . basename($document['filename']) . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    
    // Clear output buffer
    if (ob_get_level()) {
        ob_end_clean();
    }
    
    // Read file in chunks to handle large files
    if ($fp = fopen($filePath, 'rb')) {
        while (!feof($fp) && connection_status() == 0) {
            echo fread($fp, 8192);
            flush();
        }
        fclose($fp);
    } else {
        throw new Exception("Cannot read file");
    }
    exit;

} catch (Exception $e) {
    error_log("Download error: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'details' => $e->getMessage()
    ]);
}
?>