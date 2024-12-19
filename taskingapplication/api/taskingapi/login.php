<?php
include_once("database.php");

// Allow all origins (you can restrict this to specific domains if needed)
header("Access-Control-Allow-Origin: *");

// Allow specific HTTP methods
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Allow specific headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests for OPTIONS method
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the raw POST data
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

if (isset($postdata) && !empty($postdata)) {
    $password = trim($request->password);
    $admin_username = trim($request->admin_username);

    try {
        // Check the database connection
        $stmt = $pdo->prepare("SELECT * FROM admin WHERE admin_username = :admin_username");
        $stmt->bindParam(':admin_username', $admin_username);
        $stmt->execute();

        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        // Ensure the username exists and passwords match (if plain text password)
        if ($admin && $password === $admin['password']) {
            // If the password matches, send the admin data back
            echo json_encode([$admin]);
        } else {
            error_log("Login failed for user: " . $admin_username);
            echo json_encode(['error' => 'Invalid username or password']);
            http_response_code(401);  // Unauthorized
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        http_response_code(500);  // Internal Server Error
    }
} else {
    echo json_encode(['error' => 'No input data received']);
    http_response_code(400);  // Bad Request
}
?>