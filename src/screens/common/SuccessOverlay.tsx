import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Box, Center, VStack, Text } from '@/src/components/common/GluestackUI';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

interface SuccessOverlayProps {
    isVisible: boolean;
    message?: string;
    redirectMessage?: string;
    onClose?: () => void;
}

export const SuccessOverlay = ({
    isVisible,
    message = "Your password is updated",
    redirectMessage = "Taking you back...",
    onClose
}: SuccessOverlayProps) => {
    const successScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            // High-energy spring pop
            Animated.spring(successScale, {
                toValue: 1,
                damping: 12,
                stiffness: 150,
                useNativeDriver: true,
            }).start();
        } else {
            successScale.setValue(0);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <Box className="absolute inset-0 z-[100] bg-white/50">
            <LinearGradient
                colors={['#10b981', '#065f46', '#022c22']}
                locations={[0, 0.6, 1]}
                style={{ flex: 1 }}
            >
                <Center className="flex-1 px-6">
                    <Animated.View style={{ transform: [{ scale: successScale }], alignItems: 'center' }}>
                        <VStack space="2xl" className="items-center">

                            {/* Animation Box */}
                            <Box className="w-64 h-64">
                                <LottieView
                                    source={require('../../assets/animations/done_success.json')}
                                    autoPlay
                                    loop={false}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </Box>

                            {/* Text Content */}
                            <VStack space="md" className="items-center">
                                <Text className="text-white text-4xl font-bold">Success!</Text>
                                <Box className="bg-white/10 px-6 py-2 rounded-2xl border border-white/20">
                                    <Text className="text-emerald-50 text-base">{message}</Text>
                                </Box>
                            </VStack>

                            <Text className="text-emerald-200/50 text-sm mt-10">
                                {redirectMessage}
                            </Text>
                        </VStack>
                    </Animated.View>
                </Center>
            </LinearGradient>
        </Box>
    );
};