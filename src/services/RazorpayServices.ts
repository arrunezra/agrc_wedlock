import api from "../api/api";

export const RazorpayServices = {


    getOrderId: async (body: any, logoutFn?: () => void) => {
        debugger
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const response = await api.post('/razorpay_operation/generate_transaction_orderid.php', body);
                return response.data; // Success path returns normal data
            } catch (error: any) {
                attempts++;
                console.error(`Attempt ${attempts} - Error generating order ID:`, error);
                debugger
                const isUnauthorized = error.response?.status === 401;

                if (isUnauthorized) {
                    if (attempts >= maxRetries) {
                        console.log("Max unauthorized retries reached. Triggering fallback response handling...");

                        return {
                            success: false,
                            status: 401,
                            message: "Session expired. Please log in again."
                        };
                    }

                    // Wait 1 second before firing the next retry attempt
                    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000)); continue;
                }

                // If it's a different kind of error (e.g., 500 Internal Error or 404), throw it to the UI catch block
                throw error;
            }
        }
    },

    verifyContributtion: async (body: any) => {
        try {
            const response = await api.post('/razorpay_operation/verifyContributtion.php', body);
            return response.data;

        } catch (error) {

            console.error("Error deleting staff:", error);

        }
    },
}

export default RazorpayServices;
