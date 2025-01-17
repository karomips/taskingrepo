<?php
// send-email.php

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:57175");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

try {
    // Log incoming request
    error_log("Email request received: " . file_get_contents("php://input"));
    
    // Get and validate input
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['to']) || !isset($data['subject']) || !isset($data['body'])) {
        throw new Exception("Missing required fields");
    }

    $mail = new PHPMailer(true);
    
    // Enable debug logging
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->Debugoutput = function($str, $level) {
        error_log("PHPMailer Debug: $str");
    };
    
    // Server settings
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'eoportaltaskingsystem@gmail.com';
    $mail->Password = 'ngcc adkn wdzx wvuy'; // Your app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // Increase timeout values
    $mail->Timeout = 60; // Timeout for SMTP connection
    $mail->SMTPKeepAlive = true; // Keep connection alive

    // Recipients
    $mail->setFrom('eoportaltaskingsystem@gmail.com', 'Administrator');
    $mail->addAddress($data['to']);

    // Content
    $mail->isHTML(true);
    $mail->Subject = $data['subject'];
    $mail->Body = nl2br($data['body']);
    $mail->AltBody = strip_tags($data['body']);

    $result = $mail->send();
    error_log("Email send result: " . ($result ? "Success" : "Failed"));
    
    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Email Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => $mail->ErrorInfo ?? null
    ]);
}