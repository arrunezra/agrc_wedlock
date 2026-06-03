import React from 'react';
import { StyleSheet } from 'react-native';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    Box,
    VStack,
    HStack,
    Text,
    Progress,
    ProgressFilledTrack,
    Heading,
    Center,
} from '../components/GluestackUI';
import LottieView from 'lottie-react-native';
import GlassBlur from './GlassBlur';

interface UploadProgressModalProps {
    isOpen: boolean;
    uploadProgress: number;
}

export const UploadProgressModal = ({ isOpen, uploadProgress }: UploadProgressModalProps) => {
    return (
        <Modal isOpen={isOpen} useRNModal={true} finalFocusRef={undefined}>
            <ModalBackdrop className="bg-black/40" />
            <ModalContent className="bg-transparent shadow-none border-0">
                <Center>
                    {/* Glass Container */}
                    <Box className="w-[85%] h-[280px] rounded-[40px] overflow-hidden border border-white/20">

                        {/* Native Blur Layer */}

                        <GlassBlur
                            blurAmount={15}
                            overlayColor="rgba(255, 255, 255, 0.1)"
                            className="w-80 p-6 rounded-2xl border border-white/20 shadow-xl"
                        >
                            {/* 💎 Place your UI content here */}
                            <Text className="text-white text-lg font-bold">blur Amount</Text>
                            <Text className="text-white text-2xl font-black"> </Text>
                        </GlassBlur>

                        {/* 1. Lottie Animation - Absolute Positioned at top */}
                        <Box className="absolute top-2 self-center w-32 h-32">
                            <LottieView
                                source={require('../../assets/animations/uploading.json')}
                                autoPlay
                                loop={true} // Changed to true for "Uploading" state
                                style={{ width: '100%', height: '100%' }}
                            />
                        </Box>

                        {/* 2. Content Wrapper - Shifted down to clear the animation */}
                        <VStack space="xl" className="p-8 pt-32 items-center justify-center flex-1">

                            {/* Header Section */}
                            <VStack space="xs" className="items-center">
                                <Heading className="text-white text-2xl font-black tracking-tighter">
                                    {uploadProgress < 100 ? 'Uploading...' : 'Finalizing...'}
                                </Heading>
                                <Text className="text-white/50 text-xs font-bold uppercase tracking-[2px]">
                                    Processing Image
                                </Text>
                            </VStack>

                            {/* Progress Section */}
                            <VStack className="w-full" space="md">
                                <Box className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <Progress value={uploadProgress} className="h-full w-full bg-transparent">
                                        <ProgressFilledTrack
                                            className="bg-cyan-400"
                                            style={{
                                                shadowColor: '#22d3ee',
                                                shadowOpacity: 1,
                                                shadowRadius: 10,
                                                elevation: 5
                                            }}
                                        />
                                    </Progress>
                                </Box>

                                <HStack className="justify-between items-center px-1">
                                    <Text className="text-cyan-400 font-black text-sm">{uploadProgress}%</Text>

                                    <HStack space="xs">
                                        <Box className="h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-100" />
                                        <Box className="h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-50" />
                                        <Box className="h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-20" />
                                    </HStack>
                                </HStack>
                            </VStack>

                        </VStack>
                    </Box>
                </Center>
            </ModalContent>
        </Modal>
    );
};