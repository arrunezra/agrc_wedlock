import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL_DEV } from '../utils/environment';
import { globalLogoutTrigger } from '../context/AuthContext';
import { emitNetworkTimeout } from '../utils/eventEmitter';

export const API_BASE_URL = API_BASE_URL_DEV;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds cutoff limit
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

// 2. Response Interceptor: Dual Engine (Token Expiration + Network Resilience)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { message, code } = error;

    // Isolate what type of error occurred
    const is401Error = error.response?.status === 401;
    const isNetworkError = message === 'Network Error' || code === 'ECONNABORTED';

    // ==========================================
    // ENGINE A: HARD NETWORK DOWN / TIMEOUTS
    // ==========================================
    if (isNetworkError && originalRequest) {
      originalRequest._networkRetryCount = originalRequest._networkRetryCount || 0;

      // Check if we exhausted our 3 automatic network retry attempts
      if (originalRequest._networkRetryCount >= 3) {
        console.log('❌ Max network retries reached. Triggering Global Network Error Screen...');
        emitNetworkTimeout(); // 🚀 Broadcast event to show NetworkErrorScreen overlay
        return Promise.reject(error);
      }

      // Increment network loop try counter
      originalRequest._networkRetryCount += 1;

      // Calculate delay using exponential backoff scaling (2s, 4s, 8s)
      const delay = Math.pow(2, originalRequest._networkRetryCount) * 1000;
      console.log(`📡 Network issue. Retrying in ${delay}ms... (Attempt ${originalRequest._networkRetryCount}/3)`);

      await new Promise((resolve) => setTimeout(() => resolve, delay));
      return api(originalRequest); // Resend into the loop
    }

    // ==========================================
    // ENGINE B: 401 UNAUTHORIZED / TOKEN RENEWAL
    // ==========================================
    if (is401Error && originalRequest) {
      originalRequest._authRetryCount = originalRequest._authRetryCount || 0;

      // If we already retried 3 times for auth and it still fails, boot them out
      if (originalRequest._authRetryCount >= 3) {
        console.log('🔄 401 encountered 3 times consecutively. Forcing logout...');
        globalLogoutTrigger(); // Clean up app memory context state synchronously
        return Promise.reject(error);
      }

      originalRequest._authRetryCount += 1;
      console.log(`🔄 Token expired. Requesting silent refresh... Attempt #${originalRequest._authRetryCount}`);

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available in storage');
        }

        // Call your backend php utility directly via raw axios to prevent infinite recursive interceptor loops
        const res = await axios.post(`${API_BASE_URL}/helpers/refresh.php`, {
          refresh_token: refreshToken
        });

        if (res.data?.access_token) {
          const newAccessToken = res.data.access_token;
          await AsyncStorage.setItem('accessToken', newAccessToken);

          // Update original header pointer configurations
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Re-dispatch target request smoothly
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('❌ Refresh verification handshake rejected. Clearing credentials...');
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData', 'rememberMe']);
        globalLogoutTrigger(); // Kick out to Login route completely
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;