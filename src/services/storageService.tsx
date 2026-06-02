import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  setItem: async (key:any, value:any) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  getItem: async (key:any) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  removeItem: async (key:any) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },
  
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};