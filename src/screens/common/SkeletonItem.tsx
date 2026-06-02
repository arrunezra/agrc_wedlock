import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Box, HStack, VStack, Center } from '@/src/components/common/GluestackUI';

export const SkeletonItem = () => {
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={{ opacity: pulseAnim }}>
            <Box className="p-4 mb-4 bg-white rounded-xl border border-outline-100 shadow-sm">
                <HStack space="md">
                    {/* Avatar Placeholder */}
                    <Box className="w-16 h-16 rounded-full bg-background-200" />

                    <VStack space="xs" className="flex-1 justify-center">
                        {/* Name Line */}
                        <Box className="w-3/4 h-4 rounded bg-background-200" />
                        {/* Subtitle Line */}
                        <Box className="w-1/2 h-3 rounded bg-background-200" />
                    </VStack>
                </HStack>
            </Box>
        </Animated.View>
    );
};