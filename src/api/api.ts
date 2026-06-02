import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL_DEV } from '../utils/environment';

// Update this with your PHP backend URL
export const API_BASE_URL = API_BASE_URL_DEV;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
// 1. Request Interceptor: Attach the Access Token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    //console.log('token', token)
    if (token) {
      // Use set() or ensure headers object exists
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // DEBUG: Look at your console! 
    // If you don't see 'Bearer ...' here, AsyncStorage is returning null.
    //console.log('Final Headers Sent:', config.headers);

    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: The "Silent Refresh" Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Expired) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retrying to avoid infinite loops

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        // Attempt to get a new access token from your PHP backend
        const res = await axios.post(`${API_BASE_URL}/helpers/refresh.php`, {
          refresh_token: refreshToken
        });

        if (res.data.access_token) {
          const newAccessToken = res.data.access_token;
          await AsyncStorage.setItem('accessToken', newAccessToken);

          // Update the header of the original request and retry it
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token is also expired or invalid: Force Logout
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
        // Here you would typically use a navigation ref to redirect to Login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;