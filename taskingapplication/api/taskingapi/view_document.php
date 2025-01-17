<?php
require 'database.php';

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

try {
    if (!isset($_GET['document_id'])) {
        throw new Exception('Document ID is required');
    }

    $documentId = intval($_GET['document_id']);
    
    // Get document information
    $stmt = $pdo->prepare("SELECT ad.document_id, ad.filepath, ad.filename, ad.document_type, 
                                 a.first_name, a.last_name, a.applicant_id 
                          FROM applicant_documents ad
                          JOIN applicants a ON ad.applicant_id = a.applicant_id
                          WHERE ad.document_id = :document_id");
    $stmt->bindParam(':document_id', $documentId, PDO::PARAM_INT);
    $stmt->execute();
    $document = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$document) {
        throw new Exception("Document not found");
    }

    // Construct the correct file path using applicant_id
    $filePath = $_SERVER['DOCUMENT_ROOT'] . '/4ward/eoportal/eoportalapi/uploads/documents/' . 
                $document['applicant_id'] . '/' . basename($document['filepath']);
    
    if (!file_exists($filePath)) {
        error_log("File not found at: " . $filePath);
        throw new Exception("File not found at path: " . $filePath);
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $filePath);
    finfo_close($finfo);

    // Handle different file types
    switch ($mimeType) {
        case 'application/pdf':
            header('Content-Type: application/pdf');
            header('Content-Disposition: inline; filename="' . basename($document['filename']) . '"');
            header('Cache-Control: public, must-revalidate, max-age=0');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filePath));
            
            if (ob_get_level()) ob_end_clean();
            
            if ($fp = fopen($filePath, 'rb')) {
                while (!feof($fp) && connection_status() == 0) {
                    echo fread($fp, 8192);
                    flush();
                }
                fclose($fp);
            }
            break;
            
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
            header('Content-Type: ' . $mimeType);
            header('Content-Disposition: inline; filename="' . basename($document['filename']) . '"');
            header('Cache-Control: public, must-revalidate, max-age=0');
            header('Pragma: public');
            header('Content-Length: ' . filesize($filePath));
            
            if (ob_get_level()) ob_end_clean();
            
            if ($fp = fopen($filePath, 'rb')) {
                while (!feof($fp) && connection_status() == 0) {
                    echo fread($fp, 8192);
                    flush();
                }
                fclose($fp);
            }
            break;
            
        default:
            // For other file types, show a preview page
            ?>
            <!DOCTYPE html>
            <html>
            <head>
                <title>Document Preview - <?php echo htmlspecialchars($document['filename']); ?></title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .preview-container { max-width: 800px; margin: 0 auto; }
                    .document-info { margin-bottom: 20px; }
                    .actions { margin-top: 20px; }
                    .button { 
                        padding: 10px 20px; 
                        background-color: #007bff; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                    }
                </style>
            </head>
            <body>
                <div class="preview-container">
                    <div class="document-info">
                        <h2><?php echo htmlspecialchars($document['filename']); ?></h2>
                        <p>Type: <?php echo htmlspecialchars($document['document_type']); ?></p>
                        <p>Applicant: <?php echo htmlspecialchars($document['first_name'] . ' ' . $document['last_name']); ?></p>
                    </div>
                    <div class="preview">
                        <p>Preview not available for this file type.</p>
                    </div>
                    <div class="actions">
                        <a href="download_document.php?document_id=<?php echo $documentId; ?>" 
                           class="button" download>Download File</a>
                    </div>
                </div>
            </body>
            </html>
            <?php
            break;
    }
    exit;

} catch (Exception $e) {
    error_log("View document error: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Error processing view request',
        'details' => $e->getMessage()
    ]);
}