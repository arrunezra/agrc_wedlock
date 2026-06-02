import api from "../api/api";


export const FileService = {
    uploadFile: async (credentials: any, config: any) => {

        try {
            const response = await api.post(`/files/dms_file_upload.php`, credentials, config);
            console.log();
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                return error.response.data;
            }
            return { success: false, message: "Network connection failed" };
        }
    }
}