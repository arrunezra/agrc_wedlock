import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { AuthContextType, User } from '../utils/models';

// 1. Create a singleton controller reference pointer for Axios file access 
let forceLogoutRef: () => void = () => { };

export const globalLogoutTrigger = () => {
  if (forceLogoutRef) {
    forceLogoutRef();
  }
};

// 2. Create the Context with an initial undefined value
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

  // Bind the global handler during component creation mounting lifecycle
  useEffect(() => {
    forceLogoutRef = handleSessionExpirationCleanup;
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      const access = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('userData');

      // 🎯 Fix: Even if rememberMe is false, if tokens exist in current workspace, 
      // let them stay authenticated until the session expires or they close the app.
      if (rememberMe === 'true' && access && userData) {

        // if possible to store the credential and call login methoed to refreh the token
        setAccessToken(access);
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any) => {
    try {
      const { phoneNumber, password, rememberMe } = credentials;
      const response = await authService.login({ phoneNumber, password });

      if (response.access_token) {
        // Update operational component memory state immediately
        setAccessToken(response.access_token);
        setIsAuthenticated(true);

        if (response.user) {
          setUser(response.user);
        }

        // Always write transactional keys for the interceptor refresh processes
        await AsyncStorage.multiSet([
          ['accessToken', response.access_token],
          ['refreshToken', response.refresh_token || '']
        ]);

        if (rememberMe) {
          await AsyncStorage.setItem('rememberMe', 'true');
          if (response.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          }
        } else {
          await AsyncStorage.setItem('rememberMe', 'false');
          if (response.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          }
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
      // Graceful degradation structural boundary safety catch
    } finally {
      await handleSessionExpirationCleanup();
      return { success: true };
    }
  };

  // 🔄 Dedicated Interceptor Target: Drops memory layout maps back to base default states synchronously
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