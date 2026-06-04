import React, { createContext, useContext, useState, ReactNode } from 'react';
import GlobalAlert, { CustomAlertConfig } from '@/src/components/GlobalAlert';


interface AlertContextType {
    showAlert: (options: CustomAlertConfig) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<CustomAlertConfig>({
        type: 'info',
        title: '',
        message: '',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => { },
    });

    const showAlert = (options: CustomAlertConfig) => {
        setConfig(options);
        setIsOpen(true);
    };

    const hideAlert = () => setIsOpen(false);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <GlobalAlert
                isOpen={isOpen}
                onClose={hideAlert} // The controller
                config={config}     // The data
            />
        </AlertContext.Provider>
    );
};


export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within AlertProvider');
    return context;
};