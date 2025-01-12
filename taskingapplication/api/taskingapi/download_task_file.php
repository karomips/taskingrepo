<?php
require 'database.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

try {
    if (!isset($_GET['file_id'])) {
        throw new Exception('File ID is required');
    }

    $fileId = intval($_GET['file_id']);
    
    // Get file information from database (Query the task_files table)
    $stmt = $pdo->prepare("SELECT id, filepath, filename FROM task_files WHERE id = :file_id");
    $stmt->bindParam(':file_id', $fileId, PDO::PARAM_INT);
    $stmt->execute();
    $file = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$file) {
        throw new Exception("File record not found for ID: $fileId");
    }

    // Construct the absolute path to the file
    $baseUploadPath = $_SERVER['DOCUMENT_ROOT'] . '/4ward/eoportal/eoportalapi/uploads/task_files/';
    $filePath = $baseUploadPath . ltrim($file['filepath'], '/');  // Ensure relative paths are correctly handled
    
    error_log("Attempting to access file at: " . $filePath);
    
    if (!file_exists($filePath)) {
        throw new Exception("File does not exist at path: $filePath");
    }

    // Get file mime type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $filePath);
    finfo_close($finfo);

    // Set headers for download
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . basename($file['filename']) . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Pragma: public');
    
    // Clear output buffer
    if (ob_get_level()) {
        ob_end_clean();
    }
    
    // Read and output file
    if (!readfile($filePath)) {
        throw new Exception("Failed to read file: $filePath");
    }
    exit;

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Error processing download request',
        'details' => $e->getMessage()
    ]);
}
?>
