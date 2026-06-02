import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import { RoleBasedNavigator } from './RoleBasedNavigator';
import SplashScreen from '../components/common/SplashScreen';
import { useEffect, useState } from 'react';

export default function AppNavigator() {
  const { isLoading, isAuthenticated, userRole, user, logout } = useAuth();

  // State to track if the minimum 2-second splash timer has completed
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    // Start a 2000ms timer as soon as the component mounts
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, 3000);

    // Clean up the timeout if the component unmounts early to prevent memory leaks
    return () => clearTimeout(timer);
  }, []);

  // Show SplashScreen if the authentication data is still loading 
  // OR if our 2-second minimum timer hasn't run out yet
  if (isLoading || !isTimedOut) {
    return <SplashScreen />;
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