import React from 'react';
import LottieView from 'lottie-react-native';
import { Box, VStack, Heading, Text, Button, ButtonText } from '@/src/components/GluestackUI';

interface NotFoundProps {
    title?: string;
    description?: string;
    onReset?: () => void;
    buttonText?: string;
}

export default function NotFoundScreen({
    title = "No Records Found",
    description = "We couldn't find what you're looking for. Try adjusting your filters.",
    onReset,
    buttonText = "Clear All Filters"
}: NotFoundProps) {
    return (
        <Box className="flex-1 bg-white justify-center px-6">
            <VStack className="items-center gap-6">
                {/* Lottie Animation - Use a 'not found' or 'empty' json */}
                <Box className="w-64 h-64">
                    <LottieView
                        source={require('@/src/assets/animations/not-found.json')}
                        autoPlay
                        loop
                        style={{ width: '100%', height: '100%' }}
                    />
                </Box>

                <VStack className="items-center gap-2">
                    <Heading size="xl" className="text-center text-typography-900">
                        {title}
                    </Heading>
                    <Text className="text-center text-typography-500 text-md px-4">
                        {description}
                    </Text>
                </VStack>

                {onReset && (
                    <Button
                        size="lg"
                        className="bg-slate-800 rounded-full w-full h-14 mt-8"
                        onPress={onReset}
                    >
                        <ButtonText className="font-bold text-lg">{buttonText}</ButtonText>
                    </Button>
                )}
            </VStack>
        </Box>
    );
}