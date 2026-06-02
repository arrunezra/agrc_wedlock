import api from "../api/api";

export const ChruchService = {

    deleteChurchByID: async (id: string) => {
        try {
            const response = await api.post('/church/churchmanagment.php', {
                action: 'delete',
                id: id
            }); return response.data;

        } catch (error) {
            console.error("Error deleting church:", error);

        }
    },
    addUpdateChurch: async (data: any) => {
        try {
            const response = await api.post('/church/churchmanagment.php', data);
            return response.data;
        } catch (error) {
            console.error("Error adding/updating church:", error);
        }
    },
    getCurchBranches: async (cityCode: string) => {
        try {
            const response = await api.post('/church/churchmanagment.php', {
                action: 'getChurchBranches',
                cityCode: cityCode
            });
            return response.data;
        } catch (error) {
            console.error("Error getting church branches:", error);
        }
    },
    getChurchDetails: async (body: any) => {
        try {
            const response = await api.post('/church/get_churches.php', body);
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export default ChruchService;
