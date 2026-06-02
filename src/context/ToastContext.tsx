import React, { createContext, useContext, useCallback } from 'react';
import { Vibration, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const ToastContext = createContext<any>(null);

export const AppToastProvider = ({ children }: { children: React.ReactNode }) => {
    const insets = useSafeAreaInsets();
    const showToast = useCallback((title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
        // 1. Keep your vibration logic
        Toast.hide();
        const uniqueId = Date.now().toString();
        if (type === 'success') {
            Vibration.vibrate(70);
        } else if (type === 'error') {
            Vibration.vibrate([0, 100, 50, 100]);
        } else if (type === 'info') {
            Vibration.vibrate([0, 40, 40, 40]); // Subtle double "alert" pulse
        }

        // 2. Trigger the new Toast library
        setTimeout(() => {
            Toast.show({
                type: type,
                text1: title,
                text2: description,
                position: 'top',
                topOffset: insets.top > 0 ? insets.top + 10 : 40,
                visibilityTime: 3000,
                autoHide: true,
                swipeable: true,
                props: { id: uniqueId },
                onPress: () => Toast.hide(),
            });
        }, 100);
    }, [insets]);


    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useAppToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useAppToast must be used within AppToastProvider');
    return context;
};