<?php
include_once("database.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json');

$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (isset($postdata) && !empty($postdata)) {
    $admin_id = trim($request->admin_id);  // Use admin_id for login
    $pwd = trim($request->password);

    try {
        // Assuming the admin data is stored in a table 'admins'
        $sql = "SELECT * FROM admins WHERE admin_id = :admin_id";  // Check for admin login
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':admin_id', $admin_id);
        $stmt->execute();
        
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($admin && password_verify($pwd, $admin['password'])) {
            // Remove the password before sending
            unset($admin['password']);
            echo json_encode([$admin]); // Return admin data as JSON
        } else {
            http_response_code(404);  // Invalid credentials
            echo json_encode(['error' => 'Invalid admin credentials']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
