import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { CropZoom, useImageResolution, type CropZoomRefType } from 'react-native-zoom-toolkit';
import {
    Box, Button, ButtonText, Modal, ModalBackdrop,
    ModalContent, Heading, HStack,
    VStack
} from './GluestackUI';

export default function StaffImageCropView({ imageUri, onConfirm, onCancel }: any) {

    const cropZoomRef = useRef<CropZoomRefType>(null);

    // 1. Hook to get image dimensions for perfect aspect ratio
    const { resolution } = useImageResolution(imageUri.path);

    const handleConfirm = async () => {
        // Request the cropped result from the toolkit
        const result = cropZoomRef.current?.crop();
        if (result) {
            onConfirm(result); // Pass the cropped image back to your upload function
        }
    };

    return (
        <VStack className="flex-1 bg-black justify-center">
            <Heading className="text-white text-center mb-4">Adjust Profile Photo</Heading>

            <Box className="w-full aspect-square bg-slate-900 overflow-hidden">
                {resolution ? (
                    <CropZoom
                        ref={cropZoomRef}
                        resolution={resolution}
                        // Define the crop area (1:1 for Avatars)
                        cropSize={{ width: 300, height: 300 }}
                        // Define the visual container
                        //containerSize={{ width: 400, height: 400 }}
                        minScale={1}
                        maxScale={5}
                    >
                        <Image
                            source={{ uri: imageUri.path }}
                            style={{ width: '100%', height: '100%' }}
                        />
                    </CropZoom>
                ) : (
                    <ActivityIndicator size="large" color="#ffffff" />
                )}
            </Box>

            <HStack space="md" className="mt-8 justify-center p-4">
                <Button variant="outline" onPress={onCancel}>
                    <ButtonText className="text-white">Cancel</ButtonText>
                </Button>
                <Button action="primary" onPress={handleConfirm}>
                    <ButtonText>Save Crop</ButtonText>
                </Button>
            </HStack>
        </VStack>
    );
}