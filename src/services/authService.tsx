import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";


export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login.php', credentials);
    return response.data;
  },

  signup: async (userData: any) => {
    const response = await api.post('/users/register.php', userData);
    return response.data;
  },

  logout: async () => {
    try {
      // Optional: Tell backend to invalidate the refresh token in DB
      await api.post('/auth/logout.php');
    } finally {
      // Always clear local storage
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
    }
  },
  getUser: async () => {
    const data = await AsyncStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  },
  verifyToken: async () => {
    const response = await api.get('/auth/verify.php');
    return response.data;
  },
  forgotPassword: async (body: any) => {
    const response = await api.post('/auth/reset_password.php', body);
    return response.data;
  },
};

export default authService;