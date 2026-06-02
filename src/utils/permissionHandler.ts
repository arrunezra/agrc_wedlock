import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { Platform, Alert } from 'react-native';

export const PermissionTypes = {
  // 2026 Update: Handling the Android 13+ granular media permissions
  STORAGE: Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: Number(Platform.Version) >= 33 
      ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES // For Picker, this is usually enough
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  }),
  CAMERA: Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  }),
};

export const requestPermission = async (permission: any): Promise<boolean> => {
  const status = await check(permission);

  if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
    return true;
  }

  if (status === RESULTS.DENIED) {
    const requestStatus = await request(permission);
    return requestStatus === RESULTS.GRANTED || requestStatus === RESULTS.LIMITED;
  }

  if (status === RESULTS.BLOCKED) {
    Alert.alert(
      'Permission Required',
      'This feature needs access to your camera and files. Would you like to enable it in settings?',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => openSettings() }
      ]
    );
    return false;
  }

  return false;
};