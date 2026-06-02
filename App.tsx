/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */



import '@/global.css';
import { ActivityIndicator, Platform, Pressable, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ThemeProvider } from './components/ui/ThemeProvider/ThemeProvider';
import { useCallback, useEffect, useState } from 'react';
import { PermissionTypes, requestPermission } from './src/utils/permissionHandler';
import { openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { AlertProvider } from './src/context/AlertContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LookupProvider } from './src/context/LookupContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/screens/common/ToastConfig';
import { AppToastProvider } from './src/context/ToastContext';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/components/common/SplashScreen';
function App() {

  const [isAllPermissionGranted, setIsAllPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      try {
        if (Platform.OS === 'android') {
          const cameraStatus = await request(PERMISSIONS.ANDROID.CAMERA);
          setIsAllPermissionGranted(cameraStatus === RESULTS.GRANTED);
        } else if (Platform.OS === 'ios') {
          const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
          setIsAllPermissionGranted(cameraStatus === RESULTS.GRANTED);
        }
      } catch (error) {
        console.error("Permission check failed: ", error);
        setIsAllPermissionGranted(false);
      } finally {
        setLoading(false);
      }
    };

    checkAndRequestPermissions();
  }, []);

  // Loading Indicator State Layout
  if (loading) {
    <SplashScreen />
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <KeyboardProvider>
            <AuthProvider>
              <AlertProvider>
                <LookupProvider>
                  <AppToastProvider>

                    {isAllPermissionGranted ? (
                      <AppNavigator />
                    ) : (
                      // Centered fallback screen forcing interaction to open system settings
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <Text style={{ fontSize: 18, color: '#333', textAlign: 'center', marginBottom: 15 }}>
                          Camera permission is required to use this application.
                        </Text>
                        <Pressable
                          onPress={() => openSettings()}
                          style={{ backgroundColor: 'rgba(11, 63, 40, 1)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
                        >
                          <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>
                            Grant Permission
                          </Text>
                        </Pressable>
                      </View>
                    )}

                  </AppToastProvider>
                </LookupProvider>
              </AlertProvider>
            </AuthProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </ThemeProvider>
      {/* Toast component stays inside the root return but outside provider structures */}
      <Toast config={toastConfig} />
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#fff' },
  errorText: { fontSize: 18, textAlign: 'center', color: '#1A1A1A', marginBottom: 24, fontWeight: '500' },
  button: { backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default App;
