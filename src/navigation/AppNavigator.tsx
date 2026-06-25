import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import { RoleBasedNavigator } from './RoleBasedNavigator';
import { useEffect, useState } from 'react';
import SplashScreen from '@/src/components/SplashScreen';
import NetworkErrorScreen from '../components/NetworkErrorScreen';
import { networkEvents } from '../utils/eventEmitter';

export default function AppNavigator() {
  const { isLoading, isAuthenticated, userRole, user, logout, checkAuthStatus } = useAuth();
  const [isTimedOut, setIsTimedOut] = useState(false);

  // 🎯 NEW STATE: Track network breakdown failure modes globally
  const [hasNetworkError, setHasNetworkError] = useState(false);

  useEffect(() => {
    // 1. Splash screen minimum delay timer
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, 3000);

    // 2. 📡 Listen for catastrophic network errors caught by Axios
    const handleGlobalTimeout = () => {
      setHasNetworkError(true);
    };

    networkEvents.on('NETWORK_TIMEOUT', handleGlobalTimeout);

    return () => {
      clearTimeout(timer);
      networkEvents.off('NETWORK_TIMEOUT', handleGlobalTimeout);
    };
  }, []);

  // 🔄 Triggered when clicking "Try Again" on the error layout view
  const handleNetworkRetry = async () => {
    setHasNetworkError(false);
    // Re-verify auth tokens or baseline configuration parameters
    if (checkAuthStatus) {
      await checkAuthStatus();
    }
  };

  // Show Splash layout during boot procedures
  if (isLoading || !isTimedOut) {
    return <SplashScreen />;
  }

  // 🚀 INTERCEPT LAYOUT: If a terminal network error happens, display the recovery screen over everything
  if (hasNetworkError) {
    return <NetworkErrorScreen onRetry={handleNetworkRetry} />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <RoleBasedNavigator userRole={userRole || ''} user={user || null} logout={logout} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}