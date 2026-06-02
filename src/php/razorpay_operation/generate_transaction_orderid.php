<?php
// Correct relative paths to your dependencies
require_once '../razorpay-php/Razorpay.php';
require_once __DIR__ . '/../error_log_config.php';
require_once '../config/database.php';
require_once '../helpers/AuthMiddleware.php';

use Razorpay\Api\Api;

// Crucial for React Native to parse the response
header("Content-Type: application/json");

// Security: In production, move these to an environment file (.env)
$key_id = 'rzp_test_SmqwhjEZRAizAi';
$key_secret = 'LkfeixGRNmJdmqVZN3t8RFJ2'; 

$api = new Api($key_id, $key_secret);

// Read JSON input from React Native
$input = json_decode(file_get_contents("php://input"), true);
$amountInRupees = $input['amount'] ?? 0; 

try {
    $db = Database::getInstance();
    
    // AuthMiddleware::check() usually handles unauthorized exits internally
    $token = AuthMiddleware::check();
    $profile_id = $token->profile_id ?? $token['profile_id']; 

    if (!$amountInRupees) {
        throw new Exception("Amount is required");
    }

    $orderData = [
        'receipt'         => 'rcpt_' . time(),
        'amount'          => $amountInRupees * 100, // Razorpay expects Paise
        'currency'        => 'INR',
        'payment_capture' => 1 
    ];

    // 1. Create Order in Razorpay
    $razorpayOrder = $api->order->create($orderData);

    // 2. Save to local DB with 'pending' status
    // FIX: Using correct variable names $razorpayOrder and $amountInRupees
    $stmt = $db->prepare("INSERT INTO payments_reciept (profile_id, razorpay_order_id, amount, status) VALUES (?, ?, ?, 'pending')");
    $stmt->execute([$profile_id, $razorpayOrder['id'], $amountInRupees]);

    // 3. Send successful response to App
    echo json_encode([
        "success" => true,
        "order_id" => $razorpayOrder['id'],
        "amount" => $orderData['amount']
    ]);

} catch (Exception $e) {
    error_log("Razor Order Creation Error: " . $e->getMessage()); 
    http_response_code(400); // Set appropriate error code
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}
?>