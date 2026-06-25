import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { Box, VStack } from './GluestackUI';
import { Icon } from './IconUI';

interface Props {
    onRetry: () => void;
}

export default function NetworkErrorScreen({ onRetry }: Props) {
    const [isRetrying, setIsRetrying] = useState(false);

    const handlePress = async () => {
        setIsRetrying(true);
        // Give a small artificial delay so the user feels the app is actually re-checking
        setTimeout(() => {
            onRetry();
            setIsRetrying(false);
        }, 1000);
    };

    return (
        <Box className="flex-1 bg-slate-900 justify-center items-center px-6">
            <VStack space="lg" className="items-center w-full">
                {/* Animated/Styled Icon Container */}
                <View className="bg-slate-800 p-6 rounded-full border border-white/10 shadow-xl mb-2">
                    <Icon as={WifiOff} size="xl" className="text-emerald-400" style={{ width: 48, height: 48 }} />
                </View>

                <VStack space="xs" className="items-center text-center">
                    <Text className="text-white text-2xl font-black tracking-tight">
                        Connection Failed
                    </Text>
                    <Text className="text-gray-400 text-sm text-center px-4 leading-5 mt-1">
                        We couldn't reach the server. Please check your internet connection and try again.
                    </Text>
                </VStack>

                {/* Retry Button */}
                <TouchableOpacity
                    onPress={handlePress}
                    disabled={isRetrying}
                    className="w-full bg-emerald-600 py-3.5 rounded-2xl items-center justify-center mt-4 shadow-lg border border-emerald-500 active:bg-emerald-700"
                >
                    {isRetrying ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-base tracking-wide">
                            Try Again
                        </Text>
                    )}
                </TouchableOpacity>
            </VStack>
        </Box>
    );
}