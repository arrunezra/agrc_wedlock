import { Divider, HStack, VStack } from '@/src/components/GluestackUI';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ style, className }: any) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Creates the pulsing/shimmer effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
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

export const ProfileSkeleton = () => {
    return (
        <VStack className="flex-1 bg-white">
            {/* 1. Large Hero Image Placeholder */}
            <SkeletonItem className="h-[450px] w-full" />

            {/* 2. Floating Card Overlap Placeholder */}
            <VStack className="p-6 gap-6 -mt-10 bg-white rounded-t-[40px] flex-1">
                {/* Name & Age Row */}
                <VStack space="xs">
                    <SkeletonItem className="h-8 w-3/4 rounded-md" />
                    <SkeletonItem className="h-4 w-1/2 rounded-md" />
                </VStack>

                <Divider className="bg-outline-50" />

                {/* About Section */}
                <VStack space="sm">
                    <SkeletonItem className="h-5 w-24 rounded-md" />
                    <SkeletonItem className="h-4 w-full rounded-md" />
                    <SkeletonItem className="h-4 w-full rounded-md" />
                    <SkeletonItem className="h-4 w-2/3 rounded-md" />
                </VStack>

                {/* Details Grid */}
                <HStack className="flex-wrap gap-4 mt-2">
                    <SkeletonItem className="h-16 w-[45%] rounded-xl" />
                    <SkeletonItem className="h-16 w-[45%] rounded-xl" />
                </HStack>
            </VStack>
        </VStack>
    );
};