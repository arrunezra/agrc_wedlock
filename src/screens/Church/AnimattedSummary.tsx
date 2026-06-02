import { HStack } from "@/components/ui/hstack";
import { Box, VStack } from "@/src/components/common/GluestackUI";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const AnimatedListItem = ({ children, index }: any) => {
    const translateY = useRef(new Animated.Value(50)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

export default AnimatedListItem;

export const ChurchSkeleton = () => {
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
        <Animated.View style={{ opacity: pulseAnim }} className="mx-4 mb-3 rounded-2xl bg-white border border-outline-50 h-24 overflow-hidden">
            <HStack className="items-stretch h-full">
                <Box className="w-1.5 bg-slate-200" />
                <HStack space="md" className="flex-1 p-4 items-center">
                    <Box className="w-12 h-12 rounded-full bg-slate-100" />
                    <VStack space="xs" className="flex-1">
                        <Box className="w-3/4 h-4 bg-slate-100 rounded" />
                        <Box className="w-1/2 h-3 bg-slate-100 rounded" />
                        <Box className="w-1/4 h-3 bg-slate-100 rounded" />
                    </VStack>
                    <Box className="w-10 h-10 rounded-full bg-slate-50" />
                </HStack>
            </HStack>
        </Animated.View>
    );
};