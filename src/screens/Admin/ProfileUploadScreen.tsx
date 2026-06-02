import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StatusBar, Dimensions, Platform, Alert } from 'react-native';
import { Box, VStack, HStack, Heading, Text, Avatar, AvatarImage, Center, useToast, Toast, ToastTitle, ToastDescription } from '@/src/components/common/GluestackUI';
import LinearGradient from 'react-native-linear-gradient';
import { MotiView } from 'moti';
import { Camera, Upload, Check, Trash2, Image as ImageIcon, ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/src/components/common/IconUI';
import api from '@/src/api/api';
import { cleanupImage, handleImageCompression } from '@/src/utils/ImageService';
import { useAuth } from '@/src/context/AuthContext';
import { useAlert } from '@/src/context/AlertContext';
import * as ImagePicker from 'react-native-image-picker'; // Standard library usage
import { useAppToast } from '@/src/context/ToastContext';
import HeaderSession from '../common/HeaderSession';
import { User } from '@/src/utils/models';
import { useFocusEffect } from '@react-navigation/native';
import { getExtension } from '@/src/utils/common';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
const { width } = Dimensions.get('window');

export const ProfileUploadScreen = ({ navigation, onUploadComplete }: any) => {
    const { user, updateUser } = useAuth();
    const { showAlert, hideAlert } = useAlert();
    const { showToast } = useAppToast();

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [tempImageUri, setTempImageUri] = useState<any>(null);

    const [uploading, setUploading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        if (user?.role === 'member') {
            setImageUri(getExtension(user?.profilePic, 'addthumnail'));
        } else {
            setImageUri(getExtension(user?.profilePic, 'url'));
        }
    }, []);

    // Handle Native Photo Gallery Launcher
    const handleSelectImage = async () => {
        try {
            // 1. Open the secure, policy-compliant Native Photo Picker
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 1, // Pass raw quality to handleImageCompression to run optimizations
                selectionLimit: 1,
            });

            // Handle user cancellation gracefully
            if (result.didCancel || !result.assets || result.assets.length === 0) {
                return;
            }

            const selectedImage = result.assets[0];

            // Map assets to keep structural compatibility with your handleImageCompression utility
            const mappedImageForCompression = {
                path: selectedImage.uri || '',
                mime: selectedImage.type || 'image/jpeg',
                filename: selectedImage.fileName || `${user?.userid || 'user'}_${Date.now()}.jpg`,
            };

            // 2. Optimize
            const compressed = await handleImageCompression(mappedImageForCompression as any);
            if (!compressed) throw new Error("Compression failed");

            setImageUri(compressed.uri);
            setTempImageUri(compressed);

        } catch (error: any) {
            //Alert.alert('profile upload')
            showAlert({
                type: 'error',
                title: 'Gallery Info.',
                message: error.message || "Something went wrong. Please try again.",
                confirmText: "OK",
                onConfirm: async () => {
                    hideAlert();
                }
            });
        }
    };

    // Handle Camera Capture Launcher
    const handleCameraCapture = () => {
        launchCamera(
            {
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: true,
            },
            (response) => {
                if (response.didCancel) return;
                if (response.errorMessage) {
                    showToast("Camera Error", response.errorMessage, "error");
                } else if (response.assets && response.assets[0].uri) {
                    const capturedAsset = response.assets[0];
                    setImageUri(capturedAsset.uri || null);

                    // Create a simulated compression footprint for direct uploads from camera rolls
                    setTempImageUri({
                        uri: capturedAsset.uri,
                        type: capturedAsset.type || 'image/jpeg',
                        name: capturedAsset.fileName || `${user?.userid || 'user'}_camera_${Date.now()}.jpg`
                    });
                }
            }
        );
    };

    // Server Upload Execution Sequence
    const handleSaveProfilePicture = async () => {
        if (!imageUri) return;

        setUploading(true);
        setProgress(0);

        try {
            // 1. Prepare Multipart Form Data Payload
            const uploadData = new FormData();

            // Handle clean URI mappings depending on current platform operating environment
            const cleanUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

            // Resolve safe standard properties in case components are submitted directly out of local memory pools
            const finalFileType = tempImageUri?.type || 'image/jpeg';
            const finalFileName = tempImageUri?.name || `${user?.userid || 'upload'}_${Date.now()}.jpg`;

            uploadData.append('file', {
                uri: cleanUri,
                type: finalFileType,
                name: finalFileName,
            } as any);

            uploadData.append('userid', user?.userid);

            // 2. Perform Network Execution via Axios Post Router
            const response = await api.post('/files/upload_staff_profile.php', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: ({ loaded, total }) => {
                    if (total && total > 0) {
                        const calculatedPercentage = Math.round((loaded * 100) / total);
                        const currentPercentage = Math.min(calculatedPercentage, 100);
                        setProgress(currentPercentage);
                    }
                }
            });

            // 3. Process Server Responses
            if (response.data && response.data.success) {
                setTimeout(async () => {
                    setUploading(false);
                    showToast("Success", "Profile photo uploaded beautifully!", "success");

                    await updateUser({
                        ...user,
                        profilePic: response.data?.file_name ?? "",
                        profileThumb: response.data?.file_name ?? ""
                    } as User);

                    if (onUploadComplete) onUploadComplete(imageUri);
                    navigation.openDrawer();
                }, 300);
            } else {
                throw new Error(response.data?.message || "Upload rejected by cloud server parameters.");
            }

        } catch (error: any) {
            setUploading(false);
            setProgress(0);
            if (imageUri) await cleanupImage(imageUri);

            console.error("API Profile Image Upload Failure Context:", error);
            showToast(
                "Upload Failed",
                error?.message || "Something went wrong while connecting to the server.",
                "error"
            );
        }
    };

    return (
        <Box className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <HeaderSession
                title="Upload Photo"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()}
            />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <VStack className="px-6 pt-8 items-center gap-8">

                    {/* Interactive Central Circular Display Frame */}
                    <Box className="items-center justify-center">
                        <MotiView
                            animate={{ scale: uploading ? 0.95 : 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="h-48 w-48 rounded-full bg-white shadow-2xl shadow-slate-300 border-4 border-white items-center justify-center relative overflow-hidden"
                        >
                            {imageUri ? (
                                <Avatar className="w-full h-full rounded-full">
                                    <AvatarImage source={{ uri: imageUri }} className="w-full h-full" />
                                </Avatar>
                            ) : (
                                <Center className="w-full h-full bg-slate-100 rounded-full px-4">
                                    <Icon as={ImageIcon} size="xl" className="text-slate-400 mb-2" />
                                    <Text size="xs" className="text-center text-slate-400 font-bold tracking-tight">No image selected</Text>
                                </Center>
                            )}

                            {/* Circular Upload Progress Overlay Mask */}
                            {uploading && (
                                <Box className="absolute inset-0 bg-slate-950/70 items-center justify-center z-30">
                                    <Text className="text-white font-black text-2xl">{`${progress}%`}</Text>
                                    <Text className="text-white/80 text-[10px] font-bold uppercase tracking-wider mt-1">Uploading...</Text>

                                    <Box className="w-24 h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
                                        <Box className="h-full bg-cyan-400" style={{ width: `${progress}%` }} />
                                    </Box>
                                </Box>
                            )}
                        </MotiView>

                        {/* Quick Trash Reset Action Button */}
                        {imageUri && !uploading && (
                            <TouchableOpacity
                                onPress={() => {
                                    setImageUri(null);
                                    setTempImageUri(null);
                                }}
                                activeOpacity={0.8}
                                className="absolute top-1 right-1 bg-rose-500 p-2.5 rounded-full border-2 border-white shadow-md z-20"
                            >
                                <Icon as={Trash2} size="xs" color="white" />
                            </TouchableOpacity>
                        )}
                    </Box>

                    {/* Media Input Channel Selection Row */}
                    {!uploading && (
                        <HStack space="md" className="w-full px-2">
                            <TouchableOpacity
                                onPress={handleSelectImage}
                                className="flex-1 flex-row h-14 bg-white border border-slate-200 rounded-2xl items-center justify-center shadow-sm shadow-slate-100 active:bg-slate-50"
                            >
                                <Icon as={Upload} size="sm" className="text-cyan-600 mr-2" />
                                <Text className="font-bold text-slate-700 text-sm">Gallery</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCameraCapture}
                                className="flex-1 flex-row h-14 bg-white border border-slate-200 rounded-2xl items-center justify-center shadow-sm shadow-slate-100 active:bg-slate-50"
                            >
                                <Icon as={Camera} size="sm" className="text-cyan-600 mr-2" />
                                <Text className="font-bold text-slate-700 text-sm">Take Photo</Text>
                            </TouchableOpacity>
                        </HStack>
                    )}
                </VStack>
            </ScrollView>

            {/* Bottom Floating Save Trigger CTA */}
            {imageUri && !uploading && (
                <Box className="absolute bottom-6 left-0 right-0 px-6">
                    <TouchableOpacity
                        onPress={handleSaveProfilePicture}
                        activeOpacity={0.9}
                        className="w-full rounded-2xl overflow-hidden shadow-lg shadow-cyan-600/30"
                        style={{ elevation: 6 }}
                    >
                        <LinearGradient
                            colors={['#0097b2', '#00bcd4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="h-14 items-center justify-center flex-row"
                        >
                            <Icon as={Check} size="sm" color="white" className="mr-2" />
                            <Text className="text-white font-black text-sm tracking-wide uppercase">Save Profile Picture</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Box>
            )}
        </Box>
    );
};

export default ProfileUploadScreen;