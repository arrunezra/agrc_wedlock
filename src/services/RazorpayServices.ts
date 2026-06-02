import api from "../api/api";

export const RazorpayServices = {

    getOrderId: async (body: any) => {
        try {
            const response = await api.post('/razorpay_operation/generate_transaction_orderid.php', body);
            return response.data;

        } catch (error) {
            console.error("Error deleting staff:", error);

        }
    },
    verifyPayment: async (body: any) => {
        try {
            const response = await api.post('/razorpay_operation/verifyPayment.php', body);
            return response.data;

        } catch (error) {
            console.error("Error deleting staff:", error);

        }
    },
}

export default RazorpayServices;
