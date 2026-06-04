import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Box, VStack, HStack } from '@/src/components/GluestackUI';

const SkeletonPulse = ({ className, style }: any) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[{ opacity, backgroundColor: '#E1E9EE' }, style]}
            className={className}
        />
    );
};

export const ProfileCardSkeleton = () => {
    return (
        <Box className="mx-4 mb-6 h-[420px] rounded-[32px] overflow-hidden bg-gray-100 border border-gray-200">
            {/* 1. Hero Image Area (Full Background) */}
            <SkeletonPulse style={StyleSheet.absoluteFill} />

            {/* 2. Top Badges Row */}
            <HStack className="absolute top-4 left-4 right-4 justify-between items-start">
                {/* Verified Badge Placeholder */}
                <SkeletonPulse className="h-8 w-24 rounded-full bg-gray-300/50" />

                {/* Like Button Placeholder */}
                <SkeletonPulse className="h-12 w-12 rounded-full bg-gray-300/50" />
            </HStack>

            {/* 3. Bottom Info Section (Simulating the Scrim area) */}
            <Box className="absolute bottom-0 left-0 right-0 p-6">
                <VStack space="sm">
                    {/* Name & Age Placeholder */}
                    <SkeletonPulse className="h-8 w-1/2 rounded-md bg-gray-300/50" />

                    {/* Location & Profession Row */}
                    <HStack space="md">
                        <SkeletonPulse className="h-4 w-24 rounded-md bg-gray-300/30" />
                        <SkeletonPulse className="h-4 w-32 rounded-md bg-gray-300/30" />
                    </HStack>
                </VStack>
            </Box>
        </Box>
    );
};