import React from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogBody,
    AlertDialogBackdrop,
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react-native';

interface StatusAlertProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'error' | 'warning' | 'success';
    title: string;
    message: string;
}

export const StatusAlert = ({ isOpen, onClose, type, title, message }: StatusAlertProps) => {
    title = title || "";
    message = message || "";
    // Config based on the alert type
    const config = {
        error: {
            icon: XCircle,
            bg: 'bg-error-100',
            iconClass: 'text-error-600',
            buttonAction: 'negative' as const,
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-warning-100',
            iconClass: 'text-warning-600',
            buttonAction: 'primary' as const,
        },
        success: {
            icon: CheckCircle2,
            bg: 'bg-success-100',
            iconClass: 'text-success-600',
            buttonAction: 'primary' as const,
        },
    };

    const current = config[type];

    return (
        <AlertDialog isOpen={isOpen} onClose={onClose}>
            <AlertDialogBackdrop />
            <AlertDialogContent className="w-[90%] max-w-[400px] p-6 gap-4 items-center rounded-3xl">
                <Box className={`rounded-full h-16 w-16 ${current.bg} items-center justify-center mb-2`}>
                    <Icon as={current.icon} size="xl" className={current.iconClass} />
                </Box>

                <AlertDialogHeader>
                    <Heading size="lg" className="text-center text-slate-800">
                        {title}
                    </Heading>
                </AlertDialogHeader>

                <AlertDialogBody>
                    <Text size="md" className="text-center text-slate-500 leading-6">
                        {message}
                    </Text>
                </AlertDialogBody>

                <AlertDialogFooter className="w-full mt-4">
                    <Button
                        action={current.buttonAction}
                        onPress={onClose}
                        className="w-full h-12 rounded-xl"
                    >
                        <ButtonText className="font-bold">Understand</ButtonText>
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};