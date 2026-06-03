<?php
require_once '../razorpay-php/Razorpay.php';
require_once __DIR__ . '/../error_log_config.php';
require_once '../config/database.php';
require_once '../helpers/AuthMiddleware.php';
require_once '../helpers/PaymentLogger.php';

use Razorpay\Api\Api;

header("Content-Type: application/json");

// 1. Initialize variables (These were missing!)
$key_id = 'rzp_test_SmqwhjEZRAizAi';
$key_secret = 'LkfeixGRNmJdmqVZN3t8RFJ2'; 
$api = new Api($key_id, $key_secret);
$db = Database::getInstance();

$token = AuthMiddleware::check();
$profile_id = $token->profile_id ?? $token['profile_id']; 


$input = json_decode(file_get_contents("php://input"), true);

// Fix syntax error in error_log (added print_r and fixed parentheses)
error_log("Razor receipt: " . print_r($input, true)); 

$razorpayOrderId   = $input['razorpay_order_id'] ?? null;
$razorpayPaymentId = $input['razorpay_payment_id'] ?? null;
$razorpaySignature = $input['razorpay_signature'] ?? null;

if (!$razorpayOrderId || !$razorpayPaymentId || !$razorpaySignature) {
    echo json_encode(["success" => false, "message" => "Missing Contribution details"]);
    exit;
}

try {
    // 2. Verify the signature (Security check)
    $attributes = [
        'razorpay_order_id'   => $razorpayOrderId,
        'razorpay_payment_id' => $razorpayPaymentId,
        'razorpay_signature'  => $razorpaySignature
    ];
	
	// Log the incoming data from the App
    PaymentLogger::log($razorpayOrderId, 'payment_attempt', $input, $profile_id); 
    
    // This method throws an Exception if the signature is invalid
    $api->utility->verifyPaymentSignature($attributes);

	// Log Success
    PaymentLogger::log($razorpayOrderId, 'signature_verified', ["status" => "success"]);
	$db->beginTransaction();
    // 3. Update status in your DB (Corrected table name consistency)
    $stmt1 = $db->prepare("UPDATE payments_reciept SET status = 'completed', razorpay_payment_id = ?, razorpay_signature = ? WHERE razorpay_order_id = ?");
    $stmt1->execute([$razorpayPaymentId, $razorpaySignature, $razorpayOrderId]);
	
    // 4. Update the Profile (The Shortcut for your App UI)
    // For example: setting a flag that they have paid for the document service
    $stmt2 = $db->prepare("UPDATE profiles SET has_active_subscription = 1, last_payment_date = NOW() WHERE profile_id = ?");
    $stmt2->execute([$profile_id]);

    $db->commit();

    echo json_encode(["success" => true, "message" => "Contribution Verified"]);

} catch (Exception $e) {
    $db->rollBack();
    error_log("Contribution Verification Error: " . $e->getMessage());
// Log exactly why it failed
    PaymentLogger::log($razorpayOrderId, 'verification_failed', ["error" => $e->getMessage()]);
    // 4. Update status to failed
    // Ensure table name here matches 'payments_reciept' used above
    $stmt = $db->prepare("UPDATE payments_reciept SET status = 'failed' WHERE razorpay_order_id = ?");
    $stmt->execute([$razorpayOrderId]);
           error_log("Contribution Verification with razorpay_order_id Error: " . razorpay_order_id);

    echo json_encode(["success" => false, "message" => "Signature Verification Failed: " . $e->getMessage()]);
}