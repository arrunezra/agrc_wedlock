import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogFooter,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  ButtonText,
  AlertDialogHeader
} from '@/src/components/common/GluestackUI';
// Import icons from your icon library (lucide-react-native is common with Gluestack)
import { AlertCircle, CheckCircle2, AlertTriangle, UploadCloud, TrashIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

type AlertType = 'success' | 'error' | 'warning' | 'info';
type ButtonAction = "primary" | "negative" | "secondary" | "positive" | "default";
export interface CustomAlertConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

// 2. This is what the Component actually receives (Data + Logic)
export interface GlobalAlertProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomAlertConfig;
}

export default function GlobalAlert({
  isOpen,
  onClose,
  config
}: GlobalAlertProps) {

  // Configuration for different alert states

  // Configuration for different alert states
  const alertConfig: Record<string, {
    icon: any;
    color: string;
    bgColor: string;
    action: ButtonAction
  }> = {
    success: {
      icon: CheckCircle2,
      color: 'stroke-success-600',
      bgColor: 'bg-success-50',
      action: 'positive', // Changed from primary to positive if supported
    },
    error: {
      icon: TrashIcon,
      color: 'stroke-error-600',
      bgColor: 'bg-error-50',
      action: 'negative',
    },
    warning: {
      icon: AlertTriangle,
      color: 'stroke-warning-600',
      bgColor: 'bg-warning-50',
      action: 'primary', // Use 'primary' or 'default' since 'warning' isn't allowed
    },
    info: {
      icon: UploadCloud,
      color: 'stroke-info-600',
      bgColor: 'bg-info-50',
      action: 'primary',
    }
  };

  // Fallback to 'info' if type is undefined
  const current = alertConfig[config.type as keyof typeof alertConfig] || alertConfig.info;


  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} >
      <AlertDialogBackdrop />
      {/* <AlertDialogContent className="p-4 gap-4 max-w-[649px] w-full md:flex-row mx-2">
        <AlertDialogBody
          className=""
          contentContainerClassName="flex-row gap-4"
        >
          <Box className={`h-10 min-[350px]:h-14 w-12 min-[350px]:w-14 rounded-full items-center justify-center ${current.bgColor}`}>
            <Icon
              as={current.icon}
              className={current.color}
              size="xl"
            />
          </Box>
          <VStack className="gap-1 flex-1">
            <Heading size="lg" className="text-typography-950 font-semibold">
              {title}
            </Heading>
            <Text size="md">{message}</Text>
          </VStack>
        </AlertDialogBody>
        <AlertDialogFooter className="flex-row justify-end gap-2">
           {onConfirm && (
            <Button variant="outline" action="secondary" onPress={onClose} size="md">
              <ButtonText>Cancel</ButtonText>
            </Button>
          )}
          <Button
            size="md"
            onPress={onConfirm || onClose}
            action={type === 'error' ? 'negative' : 'primary'}
          >
            <ButtonText>{onConfirm ? confirmText : "OK"}</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent> */}

      <AlertDialogContent className="w-[85%] max-w-[340px] p-6 rounded-3xl gap-4 items-center bg-white shadow-xl">
        {/* 1. Dynamic Icon Container */}
        <Box className={`rounded-full h-[60px] w-[60px] items-center justify-center ${current.bgColor}`}>
          <Icon
            as={current.icon}
            size="xl"
            className={current.color}
          />
        </Box>

        {/* 2. Text Content */}
        <AlertDialogHeader className="mb-1">
          <Heading size="md" className="text-center">{config.title}</Heading>
        </AlertDialogHeader>

        <AlertDialogBody>
          <Text size="sm" className="text-center text-typography-600">
            {config.message}
          </Text>
        </AlertDialogBody>

        {/* 3. Footer Buttons */}
        <AlertDialogFooter className="mt-5 w-full flex-row gap-3">
          {/* Cancel Button - Outline/Secondary */}
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            className="flex-1 rounded-xl border-outline-300"
          >
            <ButtonText>Cancel</ButtonText>
          </Button>

          {/* Confirm Button - Solid/Negative or Primary */}
          <Button
            action={current.action}
            onPress={config.onConfirm || onClose}
            className="flex-1 rounded-xl"
          >
            <ButtonText>
              {config.onConfirm ? config.confirmText : "OK"}
            </ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}