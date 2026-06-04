import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { Animated, TouchableOpacity } from 'react-native';
import { RefreshCw, X } from 'lucide-react-native';
import GradientView from './GradientView';
import { Box, VStack, Heading, Text, Button, ButtonText, Center } from './GluestackUI';

interface FailedScreenProps {
    title?: string;
    description?: string;
    onRetry?: () => void; // Renamed from onReset for clarity
    buttonText?: string;
    onPress?: () => void;
    onClose?: () => void;
}


interface FailedScreenProps {
    isVisible?: boolean;
    title?: string;
    description?: string;
    onRetry?: () => void;
    buttonText?: string;
    onPress?: () => void;
    onClose?: () => void;
}

export default function FailedScreen({
    isVisible,
    title = "Oops! Something went wrong",
    description = '',
    onRetry,
    buttonText = "Try Again",
    onClose
}: FailedScreenProps) {

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(30);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <Box className="flex-1 absolute inset-0 z-[100]">
            <GradientView
                colors={['#ef4444', '#7f1d1d', '#000000']}
                locations={[0, 0.4, 1]}
                style={{ flex: 1 }}
            >
                {/* 1. Floating Top-Right Close Button */}
                <Box className="absolute top-12 right-6 z-[110]">
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-white/10 p-3 rounded-full border border-white/20 backdrop-blur-md   "
                    >
                        <X size={24} color="white" />
                    </TouchableOpacity>
                </Box>

                <Center className="flex-1 px-8">
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                            width: '100%',
                            alignItems: 'center'
                        }}
                    >
                        <VStack space="2xl" className="items-center w-full">

                            {/* 2. Lottie Error Animation */}
                            <Box className="w-64 h-64 shadow-2xl">
                                <LottieView
                                    source={require('@/src/assets/animations/failed.json')}
                                    autoPlay
                                    loop={true}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </Box>

                            {/* 3. Text Content */}
                            <VStack space="md" className="items-center">
                                <Heading size="2xl" className="text-center text-white font-black tracking-tighter">
                                    {title}
                                </Heading>

                                {description && (
                                    <Box className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl">
                                        <Text className="text-center text-red-100/80 text-md leading-6 font-medium">
                                            {description}
                                        </Text>
                                    </Box>
                                )}
                            </VStack>

                            {/* 4. Action Buttons */}
                            <VStack space="sm" className="w-full mt-4">
                                {onRetry && (
                                    <Button
                                        size="xl"
                                        onPress={onRetry}
                                        className="bg-white rounded-[20px] w-full h-16 shadow-2xl  "
                                    >
                                        <Box className="flex-row items-center justify-center">
                                            <RefreshCw size={20} color="#dc2626" className="mr-2" />
                                            <ButtonText className="font-bold text-red-600 text-lg">
                                                {buttonText}
                                            </ButtonText>
                                        </Box>
                                    </Button>
                                )}

                                {/* Secondary Close/Back Option */}
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="py-4 items-center "
                                >
                                    <Text className="text-white/40 font-semibold tracking-wide uppercase text-xs">
                                        Dismiss and Go Back
                                    </Text>
                                </TouchableOpacity>
                            </VStack>

                        </VStack>
                    </Animated.View>
                </Center>
            </GradientView>
        </Box>
    );
}