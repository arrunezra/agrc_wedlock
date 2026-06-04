import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL_DEV } from '../utils/environment';
import { globalLogoutTrigger } from '../context/AuthContext';

export const API_BASE_URL = API_BASE_URL_DEV;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 1. Request Interceptor: Attach the Access Token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: The "3x Retry then Logout" Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized)
    if (error.response?.status === 401) {

      // Initialize or increment the retry tracker directly on the request config
      originalRequest._retryCount = originalRequest._retryCount || 0;

      // 🛑 CRITICAL CHECK: If we already retried 3 times, execute cleanup and boot them out
      if (originalRequest._retryCount >= 3) {
        console.log('🔄 401 encountered 3 times. Forcing logout...');
        // 🚀 Clear memory and storage concurrently!
        globalLogoutTrigger();
        return Promise.reject(error);
      }

      // Increment the retry counter for the next loop sequence attempt
      originalRequest._retryCount += 1;
      console.log(`🔄 Retrying API request... Attempt #${originalRequest._retryCount}`);

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to request a new temporary access token from your PHP backend
        const res = await axios.post(`${API_BASE_URL}/helpers/refresh.php`, {
          refresh_token: refreshToken
        });

        if (res.data.access_token) {
          const newAccessToken = res.data.access_token;
          await AsyncStorage.setItem('accessToken', newAccessToken);

          // Update the header authorization string with the new fresh token payload
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Resend the original request back into the custom api pipeline instance
          return api(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
        globalLogoutTrigger();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;