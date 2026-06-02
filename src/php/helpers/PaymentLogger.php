<?php
require_once '../config/database.php';

class PaymentLogger {
    public static function log($orderId, $eventType, $data, $profileId = null) {
        $db = Database::getInstance();
        $stmt = $db->prepare("INSERT INTO payment_audit_logs (razorpay_order_id, event_type, raw_response, profile_id, ip_address) VALUES (?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $orderId,
            $eventType,
            json_encode($data), // Store the full array as JSON
            $profileId,
            $_SERVER['REMOTE_ADDR'] // Log user's IP for fraud prevention
        ]);
    }
}