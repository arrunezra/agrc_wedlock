import api from "../api/api";

const AdminServices = {

    getDashboard: async (body: any) => {
        try {
            //console.log('body', body)
            const response = await api.post('/admin/getdashboardsummary.php', body);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },
    getPaymentsHistory: async (body: any) => {
        try {
            //console.log('body', body)
            const response = await api.post('/admin/get_payment_history.php', body);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

};

export default AdminServices;