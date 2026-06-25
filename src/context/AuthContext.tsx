import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import axios from 'axios'; // 🚀 Used for direct isolated network handshakes
import { API_BASE_URL_DEV } from '../utils/environment';
import { AuthContextType, User } from '../utils/models';

let forceLogoutRef: () => void = () => { };

export const globalLogoutTrigger = () => {
  if (forceLogoutRef) {
    forceLogoutRef();
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const userRole = user?.role || null;

  useEffect(() => {
    forceLogoutRef = handleSessionExpirationCleanup;
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      const access = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('userData');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      // Check if Remember Me is active and we have locally cached sessions
      if (rememberMe === 'true' && access && userData) {

        // Pre-populate memory states instantly to minimize layout shifts
        setAccessToken(access);
        setUser(JSON.parse(userData));

        try {
          if (!refreshToken) throw new Error("No refresh token stored natively");

          console.log("🔄 Validating/Refreshing session via isolated channel on startup...");

          // 🎯 FIXED: Changed 'api.post' to standard 'axios.post' with explicit URL template matching.
          // This stops the boot cycle from accidentally waking up the api.ts network error overlay loop.
          const res = await axios.post(`${API_BASE_URL_DEV}/helpers/refresh.php`, {
            refresh_token: refreshToken
          }, {
            timeout: 7000 // Quick cutoff for boot validation checks
          });

          if (res.data?.access_token) {
            const newAccessToken = res.data.access_token;

            // Commit fresh access credentials to storage layers
            await AsyncStorage.setItem('accessToken', newAccessToken);

            // Synchronize state layers cleanly
            setAccessToken(newAccessToken);
            setIsAuthenticated(true);
            console.log("✅ Session restored successfully via Refresh Token.");
            return;
          }
        } catch (refreshError: any) {
          console.warn("⚠️ Startup validation failed. Token dead or Server Unreachable:", refreshError?.message);

          // 🛑 CRITICAL RESILIENCE TRAP: If the server explicitly rejects the credentials (400/401),
          // it means the session is truly dead. Clear everything and force them out.
          if (refreshError.response?.status === 401 || refreshError.response?.status === 400) {
            console.log("❌ Token explicitly rejected by server. Cleaning up session...");
            await handleSessionExpirationCleanup();
            return;
          }

          // 📡 NETWORK OFFLINE FALLBACK: If the server is offline or the request timed out,
          // do NOT log them out! Let them use the app with their cached 'userData'.
          console.log("📡 Server unreachable on boot. Falling back to cached offline profile context.");
          setIsAuthenticated(true);
          return;
        }
      }

      // Default fallback if rememberMe is false or missing essential layout payload sets
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Global Auth status check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); // Cleanly close splash layout visibility structures
    }
  };

  const login = async (credentials: any) => {
    try {
      const { phoneNumber, password, rememberMe } = credentials;
      const response = await authService.login({ phoneNumber, password });

      if (response.access_token) {
        setAccessToken(response.access_token);
        setIsAuthenticated(true);

        if (response.user) {
          setUser(response.user);
        }

        await AsyncStorage.multiSet([
          ['accessToken', response.access_token],
          ['refreshToken', response.refresh_token || '']
        ]);

        if (rememberMe) {
          await AsyncStorage.setItem('rememberMe', 'true');
        } else {
          await AsyncStorage.setItem('rememberMe', 'false');
        }

        if (response.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        }

        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Graceful degradation structural catch
    } finally {
      await handleSessionExpirationCleanup();
      return { success: true };
    }
  };

  const handleSessionExpirationCleanup = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData', 'rememberMe']);
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  const signup = async (userData: any) => {
    try {
      return await authService.signup(userData);
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const updateUser = async (updatedData: any) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      setUser(updatedData);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isLoading,
        accessToken,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUser,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};