import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Vibration, View } from 'react-native';
import { Box, VStack, HStack, Text, Heading, Center, Modal } from '@/src/components/GluestackUI';
import { CheckCircleIcon, TrashIcon, CameraIcon, AlertCircleIcon, StarIcon, ShieldCloseIcon } from 'lucide-react-native';
import FastImage from '@d11/react-native-fast-image';
import { Icon } from '@/src/components/IconUI';
import profileService from '@/src/services/profileService';
import { useAuth } from '@/src/context/AuthContext';
import { useProfileUpload } from '@/src/hooks/useProfileUpload';
import { API_BASE_URL_DEV_Profiles_Images, API_BASE_URL_DEV_Profiles_Thumbs } from '@/src/utils/environment';
import ProfileGalleryImage from './home_sub_screen/ProfileGalleryImage';
import Gallery from 'react-native-awesome-gallery';
import { CloseIcon } from '@/components/ui/icon';
import { User } from '@/src/utils/models';
import { useAppToast } from '@/src/context/ToastContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useAlert } from '@/src/context/AlertContext';
import { CustomAlertConfig, GlobalAlertProps } from '@/src/components/GlobalAlert';
import HeaderSession from '@/src/components/HeaderSession';
import { UploadProgressModal } from '@/src/components/UploadProgressModal';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

export default function ShowProfileGalleryScreen({ route, navigation }: any) {
    const { user, updateUser } = useAuth();
    const { showToast } = useAppToast();
    const { showAlert, hideAlert } = useAlert();

    const { startUpload, isUploading, uploadProgress, isOffline } = useProfileUpload(
        user?.userid ?? "",
        user?.profile_id,
        async (data) => {
            console.log('after upload', data)
            fetchProfileDetails();
            // const updatedProfile: any = {
            //     profileThumb: data.thumb_url,
            //     profilePic: data.full_url,
            // };
            //await updateUser({ ...user, ...updatedProfile });
        }
    );

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [images, setImages] = useState<any>([
    ]);
    const [previewUrl, setPreviewUrl] = useState<any>(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchProfileDetails();
    }, []);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Optional: Trigger a tiny vibration to confirm the pull
        Vibration.vibrate(10);

        try {
            await fetchProfileDetails(); // Your API call
        } finally {
            setRefreshing(false);
        }
    }, []);
    const handleSetDefault = async (id: string) => {
        setErrorMessage('');

        try {
            const res = await profileService.setDefaultOrDeleteProfileImage(
                user?.profile_id,
                id,
                'set_default'
            );

            if (res.success) {
                const selectedImage = images?.data?.find((img: any) => img.id === id);

                if (selectedImage) {

                    //console.log('selectedImage', selectedImage)
                    const newProfilePic = selectedImage;

                    await updateUser({
                        ...user,
                        profilePic: newProfilePic.uri ?? "",
                        profileThumb: newProfilePic.thumb ?? ""
                    } as User);
                }

                // 3. Update the Local Gallery Grid State
                setImages((prev: any) => ({
                    ...prev,
                    data: prev.data.map((img: any) => ({
                        ...img,
                        isDefault: img.id === id
                    }))
                }));
                showToast("Profile Updated", "Your new photo is now active!", "success")
            } else {
                showToast("Update Failed", res.message, "error")

            }
        } catch (err) {
            showToast("Update Failed", "An error occurred while updating the profile photo.", "error")

        } finally {
        }
    };

    const handleDelete = async (id: string) => {

        showAlert({
            type: 'error',
            title: 'Delete Photo',
            message: "Are you sure you want to remove this image? If this is your main photo, the next one will become your profile picture.",
            confirmText: "Delete",
            onConfirm: async () => {
                hideAlert();
                executeDelete(id)
            }
        })


        // showAlert({
        //     type: 'error',
        //     title: 'Delete Photo',
        //     message: "Are you sure you want to remove this image? If this is your main photo, the next one will become your profile picture.",
        //     confirmText: "Delete"},
        //     onConfirm: async () => {
        //         hideAlert();
        //         executeDelete(id)
        //     }
        // }); 
    };

    const executeDelete = async (id: string) => {
        setErrorMessage('');
        try {
            const res = await profileService.setDefaultOrDeleteProfileImage(
                user?.profile_id,
                id,
                'delete'
            );

            if (res.success) {
                // Find what we are deleting to check if it's the default
                const imageToDelete = images?.data?.find((img: any) => img.id === id);
                const wasDefault = imageToDelete?.isDefault;

                // Remove the image from the local array
                const updatedData = images.data.filter((img: any) => img.id !== id);

                let newPicUri = "";
                let newThumbUri = "";

                // 2. Logic to automatically set the next available image as default
                if (updatedData.length > 0) {
                    if (wasDefault) {
                        // Promote index 0 to Default
                        updatedData[0] = { ...updatedData[0], isDefault: true };
                        newPicUri = updatedData[0].uri;
                        newThumbUri = updatedData[0].thumb;

                        // Sync with server: Tell backend index 0 is now the boss
                        await profileService.setDefaultOrDeleteProfileImage(
                            user?.profile_id,
                            updatedData[0].id,
                            'set_default'
                        );
                    } else {
                        // If we didn't delete the default, keep the existing user profile pic
                        newPicUri = user?.profilePic || "";
                        newThumbUri = user?.profileThumb || "";
                    }
                }

                // 3. Sync the Global Auth/User State
                await updateUser({
                    ...user,
                    profilePic: newPicUri,
                    profileThumb: newThumbUri
                } as User);

                // 4. Update the Gallery UI
                setImages((prev: any) => ({ ...prev, data: updatedData, count: updatedData.length }));

                showToast("Success", "Photo removed", "success");
            } else {
                showToast("Error", res.message, "error");
            }
        } catch (err) {
            showToast("Error", "Could not delete photo", "error");
        }
    };
    const fetchProfileDetails = async () => {
        setIsLoading(true)
        try {

            const res = await profileService.fetchProfileGallery(user?.userid, user?.profile_id);
            if (res.success) setImages(res);
            else {
                if (res.success == false) {
                    setErrorMessage(res.message)
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const galleryImages = useMemo(() => {
        if (!images?.data) return [];

        let profile = images.data.map((item: any, index: number) => ({
            url: `${API_BASE_URL_DEV_Profiles_Images}/${item.uri}`,
            index: index,
            file_id: item.id,
        }));
        // console.log('profile', profile);
        return profile;
    }, [images]);

    const handleOpenPreview = (index: number) => {
        setInitialIndex(index);
        setIsPreviewVisible(true);
    };

    return (
        <Box className="flex-1 bg-white">

            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Profiles Overview"
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }>

                {/* 1. Header Section */}
                <VStack className="px-4 py-6" space="xs">
                    <Heading size="xl" className="text-slate-900">My Gallery</Heading>
                    {isLoading && <Text className="text-slate-500 text-sm">{images?.count} / 5 Images Uploaded</Text>}
                </VStack>

                {/* 2. Photo Grid (2-Column Layout) */}
                <HStack className="px-4 flex-wrap" style={{ gap: 12 }}>
                    {isLoading || refreshing ? (
                        Array(6).fill(0).map((_, index) => (
                            <View
                                key={`skeleton-${index}`}
                                style={{ width: COLUMN_WIDTH, height: COLUMN_WIDTH, padding: 5 }}
                            >
                                <StaggeredSkeleton delay={index * 150}>
                                    <Skeleton
                                        variant="sharp"
                                        className="w-full h-full rounded-xl bg-gray-300 dark:bg-gray-700"
                                    />
                                </StaggeredSkeleton>
                            </View>
                        ))
                    ) : (
                        // Render actual images when loading is finished
                        images?.data?.map((item: any, index: number) => (
                            <ProfileGalleryImage
                                key={item.id}
                                item={item}
                                index={index}
                                COLUMN_WIDTH={COLUMN_WIDTH}
                                onDefault={handleSetDefault}
                                onDelete={handleDelete}
                                onPreview={handleOpenPreview}
                            />
                        ))
                    )}
                    {/* Upload Placeholder if < 5 */}
                    {images?.count < 5 && (
                        <Pressable
                            onPress={() => { startUpload('gallery', user?.profilePic) }}
                            style={{ width: COLUMN_WIDTH, height: 200 }}
                            className="border-2 border-dashed border-slate-200 rounded-[24px] items-center justify-center bg-slate-50"
                        >
                            <VStack className="items-center" space="xs">
                                <CameraIcon size={24} className="text-slate-400" />
                                <Text className="text-slate-400 text-xs font-medium">Add Photo</Text>
                            </VStack>
                        </Pressable>
                    )}
                </HStack>

                {/* 4. Guidance Footer */}
                <Box className="mx-4 mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <HStack space="sm">
                        <Icon as={AlertCircleIcon} className="text-slate-400" />
                        <VStack className="flex-1">
                            <Text className="text-slate-700 font-bold text-sm">Staff Review Policy</Text>
                            <Text className="text-slate-500 text-xs">Unverified photos are hidden from other users until our staff approves them.</Text>
                        </VStack>
                    </HStack>
                </Box>

            </ScrollView>
            <Modal
                isOpen={isPreviewVisible}
                onClose={() => setIsPreviewVisible(false)}
                style={{ margin: 0, padding: 0 }}
            >
                {/* Use a Box with a black background as the container */}
                <Box className="flex-1 bg-black w-full h-full">

                    {/* Navigation Header - High Z-Index to stay above gallery */}
                    <Box className="absolute top-12 left-0 right-0 z-50 flex-row justify-between px-6 items-center">
                        <Text className="text-white font-bold shadow-lg">
                            {initialIndex + 1} / {galleryImages.length}
                        </Text>
                        <Pressable
                            onPress={() => setIsPreviewVisible(false)}
                            className="bg-white/20 p-2 rounded-full"
                        >
                            <CloseIcon color="white" style={{ width: 24, height: 24 }} />
                        </Pressable>
                    </Box>

                    {/* The Gallery Component */}
                    <Gallery
                        data={galleryImages}
                        initialIndex={initialIndex}
                        onIndexChange={(newIndex) => {
                            console.log('newIndex', newIndex)
                            setInitialIndex(newIndex)
                        }}
                        keyExtractor={(item: any) => item.index}
                        renderItem={({ item }) => (
                            <FastImage
                                source={{ uri: item.url }}
                                style={StyleSheet.absoluteFill}
                                resizeMode="contain"
                            />
                        )}
                        onSwipeToClose={() => setIsPreviewVisible(false)}
                    />
                </Box>
            </Modal>
            <UploadProgressModal
                isOpen={isUploading}
                uploadProgress={uploadProgress}
            />
        </Box>
    );
}





const StaggeredSkeleton = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                // Wait for the specific delay before starting this block's pulse
                Animated.delay(delay),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        pulse.start();
        return () => pulse.stop();
    }, [opacity, delay]);

    return (
        <Animated.View style={{ flex: 1, opacity }}>
            {children}
        </Animated.View>
    );
};