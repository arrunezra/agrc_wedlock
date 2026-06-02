import api from "../api/api";

export const StaffService = {

    deleteStaffByID: async (id: string) => {
        try {
            const response = await api.post('/staff/staffdetails.php', {
                action: 'delete',
                id: id
            }); return response.data;

        } catch (error) {
            console.error("Error deleting staff:", error);

        }
    },
    addUpdateStaff: async (data: any) => {
        try {
            const response = await api.post('/staff/staffdetails.php', data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return { success: false, message: "Network connection failed" };
        }
    },
    getDashboardData: async () => {
        try {
            const response = await api.get('/staff/get_dashboard.php');
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return { success: false, message: "Network connection failed" };
        }
    },
    fetchStaffById: async (id: string) => {
        try {
            const response = await api.get(`/staff/staffdetails.php?action=details&id=${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return { success: false, message: "Network connection failed" };
        }
    },
    fetchSummaryStaffData: async (data: any) => {
        try {
            const response = await api.post('/staff/staffdetails.php', data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return { success: false, message: "Network connection failed" };
        }
    },
    fetchSingleStaffById: async (id: string) => {
        try {
            const response = await api.get(`/staff/staffdetails.php?action=byid&id=${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return { success: false, message: "Network connection failed" };
        }
    },
    UpdateStaff: async (data: any) => {
        try {
            const response = await api.put('/staff/staffdetails.php', data);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return { success: false, message: "Network connection failed" };
        }
    },
    fetechInboxDetails: async (body: any) => {
        try {
            const response = await api.post('/staff/staffInbox.php', body);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return { success: false, message: "Network connection failed" };
        }
    },


}

export default StaffService;
