import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { AuthContextType, User } from '../utils/models';
import { Alert } from 'react-native';



// 3. Create the Context with an initial undefined value
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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      // Updated keys to match our new logic
      const access = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('userData');

      if (rememberMe === 'true' && access && userData) {
        setAccessToken(access);
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        // Otherwise, force them to the Login screen
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
      //console.log('Login response', response)
      if (response.access_token) {
        // 1. Always update memory state so user is redirected to Home immediately
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
          if (response.user) {
            await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          }
        } else {
          //console.log("errro");
          //await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
          await AsyncStorage.setItem('rememberMe', 'false');
        }

        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.response?.message || error.message };
    }
    finally {
      // Artificial delay (Optional: 1 second) to make splash feel smooth
      setTimeout(() => setIsLoading(false), 1000);
    }
  };
  const logout = async () => {
    try {
      // 1. Notify Backend (Optional)
      await authService.logout();
    } catch (e) {
      // Even if network fails, we clear local session
    } finally {
      // 2. Clear ALL local data
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      return { success: true };
    }
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
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom hook with error handling for undefined context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};