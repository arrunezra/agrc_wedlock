import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Pressable, LayoutAnimation, Dimensions, FlatList, Modal, Alert, View, StyleSheet, Share, StatusBar } from 'react-native';
import { Box, VStack, HStack, Heading, Modal as ModalGUI, Text, BadgeText, Divider, Button, ButtonText, Avatar, AvatarFallbackText, AvatarImage, Actionsheet, ActionsheetBackdrop, ActionsheetDragIndicatorWrapper, ActionsheetDragIndicator, ActionsheetContent, ActionsheetItem, ActionsheetIcon, ActionsheetItemText, Switch, ModalContent, ModalBackdrop, } from '@/src/components/common/GluestackUI';
import { ArrowLeftRightIcon, Badge, BanIcon, BriefcaseIcon, BuildingIcon, CameraIcon, CrownIcon, FlagIcon, GraduationCapIcon, HeartIcon, HomeIcon, Icon, MapPinIcon, MoreVerticalIcon, SchoolIcon, UserIcon, UsersIcon, UtensilsIcon } from '@/src/components/common/IconUI';
import FastImage from "@d11/react-native-fast-image";
import { CheckCircleIcon, ChevronDownIcon, LockIcon, MailIcon, PhoneIcon, CheckIcon, CloseIcon, ArrowUpIcon, AddIcon, ChevronUpIcon, ShareIcon, } from '@/components/ui/icon';
import Gallery from 'react-native-awesome-gallery';
import profileService from '@/src/services/profileService';
import { ProfileSkeleton } from '@/src/components/common/ProfileSkeleton';
import NotFoundScreen from '../common/NotFoundScreen';
import { BanknoteIcon, Calendar, Check, MapPin, User, X, XIcon, ZapIcon } from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import LoadingScreen from '../common/SuccessScreen';
import { getExtension } from '@/src/utils/common';
import { useAppToast } from '@/src/context/ToastContext';
import { useAlert } from '@/src/context/AlertContext';
import LottieView from 'lottie-react-native';
import ReportProfileModal from './home_sub_screen/ReportProfileModal';
import { useNavigation } from '@react-navigation/native';
import HeaderSession from '../common/HeaderSession';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaptureProtection } from 'react-native-capture-protection';
import AnimatedMotiView from '../component/AnimateView';
import GradientView from '../component/GradientView';

export default function ProfileDetailScreen({ route }: any) {
    const { user } = useAuth();
    const { profile_id, module } = route.params; // Data passed from the list

    const { showToast } = useAppToast();
    const navigation = useNavigation<any>();

    const { showAlert, hideAlert } = useAlert();

    const [isLoading, setIsLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const windowWidth = Dimensions.get('window').width;
    const [showActionsheet, setShowActionsheet] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [errorMessage, setErrorMessage] = useState('')
    const [isReady, setIsReady] = useState(false);
    const [data, setData] = useState<any>([]);
    const [isPhotoVerifyModalVisible, setIsPhotoVerifyModalVisible] = useState(false);
    const fetchProfileDetails = useCallback(async () => {
        setIsReady(false);
        setIsNotFound(false)
        try {
            const res = await profileService.fetchProfileDetailsByID(profile_id, 'view');

            if (res.success) {
                let items = {
                    ...res.data,
                    images: res.images,
                    subscription_amount: res?.subscription_amount,
                }
                setIsLiked(res.data?.is_liked_by_me);
                //console.log('items==', items);
                setData(items);
            }
            else {
                if (res.success == false) {
                    setIsNotFound(true);
                    setErrorMessage(res.message)
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsReady(true);
        }
    }, []);


    //#region CaptureProtection 
    useEffect(
        useCallback(() => {
            CaptureProtection.prevent({ screenshot: true, record: true, appSwitcher: true });
            return () => {
                CaptureProtection.allow();

            };
        }, [])
    );
    //#endregion


    useEffect(() => {
        fetchProfileDetails()
        const logProfileView = async () => {
            try {
                await profileService.setViewLog({
                    viewed_profile_id: profile_id
                });

            } catch (e) {
                console.log("View log failed, but don't interrupt user experience");
            }
        };
        if ((user?.role == 'member') && (module == 'summary' || module == 'match')) {
            console.log('module', module, profile_id);
            logProfileView();
        }
    }, []);



    if (!isReady) {
        return <ProfileSkeleton />;
    }
    const toggleExpand = () => {
        // This triggers the smooth "slide" transition
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };
    const PreferenceRow = ({ label, value, matched }: any) => (
        <HStack className="justify-between items-start">
            <VStack className="flex-1 pr-4">
                <Text size="xs" className="text-typography-400">{label}</Text>
                <Text size="sm" className="font-medium text-typography-700">{value}</Text>
            </VStack>
            <Box className={`p-1 rounded-full border ${matched ? 'border-purple-200 bg-purple-50' : 'border-outline-200 bg-background-50'}`}>
                <Icon
                    as={matched ? CheckIcon : CloseIcon}
                    size="xs"
                    className={matched ? 'text-purple-600' : 'text-typography-300'}
                />
            </Box>
        </HStack>
    );

    const CommonGroundItem = ({ icon, color, textColor, text }: any) => (
        <HStack className="items-center gap-3">
            <Box className={`${color} p-2 rounded-full`}>
                <Icon as={icon} size="xs" className={textColor} />
            </Box>
            <Text size="sm" className="text-typography-600 flex-1">{text}</Text>
        </HStack>
    );

    // Dummy data for images

    const openGallery = (index: number) => {
        setActiveIndex(index);
        setIsModalVisible(true);
    };
    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / windowWidth);
        setActiveIndex(index);
    };
    const handleLike = async () => {
        try {
            // 1. Optimistic Update (make it feel fast)
            const previousState = isLiked;
            setIsLiked(!previousState);

            // 2. Call API
            const res = await profileService.handle_interest_block_actions({
                action: 'likes',
                target_id: profile_id
            });

            if (!res.success) {
                // Rollback if API fails
                setIsLiked(previousState);
                // Alert.alert("Error", "Could not update like status");
            } else {
                // Set the actual state from server (true or false)
                setIsLiked(res.isLiked);
            }
        } catch (error) {
            setIsLiked(!isLiked); // Rollback
            console.error(error);
        }
    }

    const handleClose = () => setShowActionsheet(false);
    const handleBlock = () => {
        handleClose();
        showAlert({
            type: 'warning',
            title: 'Block Member?',
            message: `Are you sure you want to block ${data?.full_name}? you won't see their profile again.`,
            confirmText: "Block",
            onConfirm: async () => {
                hideAlert();
                try {
                    let body = {
                        action: 'block',
                        user_id: user?.profile_id,
                        target_id: profile_id
                    }
                    const res = await profileService.handle_member_actions(body);

                    if (res.success) {
                        showToast("Bloced", `${data?.full_name} has been blocked`, "success");
                        navigation.goBack();
                    }
                    else {
                        showToast("Error", `Something wnet wrong`, "error");

                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    handleClose();
                }

            }
        });

    };

    const onReportSubmit = async (reason: string, remarks: string,) => {

        try {
            let body = {
                action: 'report',
                user_id: user?.profile_id,
                target_id: profile_id,
                reason: reason,
                remarks: remarks
            }
            const res = await profileService.handle_member_actions(body);

            if (res.success) {
                showToast("Thank you", `Your report has been submitted for review.`, "success");

            }
            else {
                showToast("Error", `Something wnet wrong`, "error");

            }
        } catch (err) {
            console.error(err);
        } finally {
            handleClose();
        }

    };
    const cmToFeetInch = (cm: any) => {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}' ${inches}"`;
    };
    const formatHeight = (input: string): string => {
        // Parse feet and inches from formats like "4ft 5in" or "4' 5""
        // const match = input?.match(/(\d+)\s*(?:ft|')\s*(\d+)\s*(?:in|")/i);

        // if (match) {
        //     const feet = match[1];
        //     const inches = match[2];
        //     return `${feet}' ${inches}"`;
        // }
        return cmToFeetInch(input)

        //return 'Invalid format';
    };
    const confirmApproveOrReject = async (id: any, action: string) => {
        hideAlert();
        try {
            let _action = action === 'approve' ? 1 : 3;
            const res = await profileService.verifyPhotos(id, _action);

            if (res.success) {
                showToast("Profile Details", ` ${action === 'approve' ? 'Profile Approved successfully!' : 'Profile rejected successfully!'}`, "success");

            }
            else {
                if (res.success == false) {
                    showToast("Profile Details", ` Something went wrong`, "error");

                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsReady(true);

        }
    }
    const handleApproveOrReject = async (id: any, action: string) => {
        try {
            // 1 - Approve
            // 3 - Reject

            if (action !== 'approve') {
                showAlert({
                    type: 'error',
                    title: 'Profile Info.',
                    message: 'Could you please confirm the rejection of this photo?',
                    confirmText: "Reject",
                    onConfirm: async () => {
                        confirmApproveOrReject(id, action)
                    }
                });
            } else confirmApproveOrReject(id, action)


        } catch (err) {
            console.error(err);
        } finally {
            setIsReady(true);
        }
    }
    const getStatusInfo = (status: number) => {
        switch (status) {
            case 1:
                return { label: 'Approved', color: 'bg-green-500', textColor: 'text-white' };
            case 3:
                return { label: 'Rejected', color: 'bg-red-500', textColor: 'text-white' };
            default:
                return { label: 'Pending', color: 'bg-yellow-500', textColor: 'text-black' };
        }
    };
    const staffImageApproveRender = ({ item, index }: any) => {
        // Determine Status Badge Data 
        const status = getStatusInfo(Number(item.is_verified));
        return (
            <Box className="relative overflow-hidden">
                {/* 1. Main Profile Image */}
                {

                }
                <FastImage
                    source={{ uri: getExtension(item.file_name, 'url') }}
                    style={{ width: windowWidth, height: 450 }}
                    resizeMode="cover"
                />

                {/* 2. Linear Gradient Overlay */}

                <GradientView
                    locations={[0, 0.4, 1]}
                    colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
                    horizontal={true}
                    style={StyleSheet.absoluteFill}

                ></GradientView>

                {/* NEW: Status Highlight Tag (Top Left) */}
                <Box className={`absolute top-4 left-4 ${status.color} px-3 py-1 rounded-md shadow-md`}>
                    <Text className={`${status.textColor} text-[10px] font-bold uppercase tracking-wider`}>
                        {status.label}
                    </Text>
                </Box>

                {/* 3. Top Right Image Counter */}
                <Box className="absolute top-4 right-4 bg-black/30 px-3 py-1 rounded-full border border-white/20">
                    <Text className="text-white text-[10px] font-bold">
                        {index + 1} / {data?.images?.length}
                    </Text>
                </Box>

                {/* 4. Floating Action Bar */}
                {/* Only show buttons if is_verified is NOT approved(1) or rejected(3) */}

                <Box className="absolute bottom-10 left-0 right-0 items-center justify-center">
                    <HStack
                        space="xl"
                        className="items-center px-8 py-4 rounded-[40px] border border-white/30 shadow-2xl"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    >
                        {/* Reject Button */}
                        <Pressable
                            onPress={() => handleApproveOrReject(item.file_id, 'reject')}
                            className="bg-[#ef4444] h-14 w-14 rounded-full items-center justify-center shadow-lg  "
                        >
                            <X color="white" size={28} strokeWidth={2.5} />
                        </Pressable>

                        {/* Approve Button with Pulse */}
                        <Box className="items-center justify-center">
                            <AnimatedMotiView
                                preset="pulse"
                                duration={1800} // Exactly matches your original 1800ms timeline loop
                                className="absolute h-14 w-14 rounded-full bg-[#22c55e]/50"
                            >
                                <Pressable
                                    onPress={() => handleApproveOrReject(item.file_id, 'approve')}
                                    className="bg-[#22c55e] h-14 w-14 rounded-full items-center justify-center shadow-lg  "
                                >
                                    <Check color="white" size={28} strokeWidth={2.5} />
                                </Pressable>
                            </AnimatedMotiView>
                        </Box>
                    </HStack>
                </Box>

            </Box>
        );
    }
    const handleToggleVerifyUser = (id: any) => {

        const newStatus = data?.IsVerified === 1 ? 0 : 1;
        setData((prev: any) => ({
            ...prev,
            IsVerified: newStatus
        }));
        updateVerifyandStatusOnServer(id, newStatus, 'verify');
    }

    const handleVerifyPhoto = () => {
        setIsPhotoVerifyModalVisible(true)
    }

    const handleToggleActiveProfile = (id: any) => {
        const newStatus = data?.IsActive === 1 ? 0 : 1;
        setData((prev: any) => ({
            ...prev,
            IsActive: newStatus
        }));
        updateVerifyandStatusOnServer(id, newStatus, 'status');


    }
    const updateVerifyandStatusOnServer = async (id: any, newStatus: number, aciton: string) => {
        setIsLoading(true);

        try {
            const res = await profileService.verifyorStatusUpdate(id, newStatus, aciton);
            if (res.success) {
                showToast("Verification", aciton == 'verify' ? "User verification successed" : "Active status updated", "success");

            }
            else {
                if (res.success == false) {
                    showToast("Verification", "something went wroing", "error");

                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);

        }
    }

    const getNoofSiblings = () => {
        if (!data?.Noof_sibling) {

            return 'Not Speified';

        } else if (data?.Noof_sibling === 0) return '0';
        else
            return `${data?.Noof_sibling || 0}  (${data?.brother_count || 0} Brother${data?.brother_count !== 1 ? 's' : ''}, ${data?.sister_count || 0} Sister${data?.sister_count !== 1 ? 's' : ''})`


    }
    return (
        isNotFound ? <NotFoundScreen title="Profile Not Found" description={errorMessage} /> :

            <Box className="flex-1 bg-[#F8FAFC]">
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                {/* 1. Put the header at the top */}
                <HeaderSession
                    title="My Profile"
                    theme="emerald"
                    showBackButton={true}
                    onBackPress={() => navigation.goBack()}
                    showRightIcon={true}
                    rightIconType="menu"
                    onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
                />
                <ScrollView className="flex-1 bg-background-50">
                    {/* 1. Hero Section */}

                    <Box className="relative h-[450px]">
                        {/* 1. Main Carousel  If enable this carousel then remove the below FastImage
                        2. If enable this carousel then remove the below FastImage becose this is for single image
                        3. also LinearGradient is not allowed for carousel (z-index issue) 
                    */}
                        {/* <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                            <FastImage
                                source={{ uri: item.uri }}
                                style={{ width: windowWidth, height: 450 }}
                                resizeMode="cover"
                            />
                        )}
                    /> */}
                        {data?.file_name ?
                            <FastImage
                                source={{ uri: getExtension(data?.file_name, 'url') }}
                                style={{ width: windowWidth, height: 450 }}
                                resizeMode="cover"
                            />
                            :
                            (
                                <Box className="flex-1 justify-center items-center bg-slate-100">
                                    <LottieView
                                        source={require('../../assets/animations/default_profile.json')}
                                        autoPlay
                                        loop
                                        style={{ width: '70%', height: '70%' }}
                                    />
                                </Box>
                            )}


                        {/* 2. TOP OVERLAY: Photo Count & Menu */}


                        {user?.role === 'member' && <VStack className="absolute top-4 right-4 items-center gap-3 z-20">
                            {/* Now wrapped in Pressable to trigger the gallery */}
                            <Pressable
                                onPress={() => openGallery(activeIndex)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <AnimatedMotiView
                                    key={activeIndex}
                                    preset="pulse"
                                    duration={1800} // Exactly matches your original 1800ms timeline loop
                                    className="absolute h-14 w-14 rounded-full bg-[#22c55e]/50"
                                >


                                    <Icon as={CameraIcon} color="white" size="xs" />
                                    <Text className="text-white text-[10px] font-bold">
                                        {activeIndex + 1} / {data?.images.length}
                                    </Text>
                                </AnimatedMotiView>

                            </Pressable>

                            <Pressable
                                className="bg-black/40 p-2 rounded-full active:bg-black/60"
                                onPress={() => setShowActionsheet(true)}
                            >
                                <Icon as={MoreVerticalIcon} size="md" color="white" />
                            </Pressable>
                        </VStack>
                        }
                        {/* 3. GRADIENT OVERLAY (The Shadow) */}
                        {/* We use 4 stops to make the transition from image to text seamless */}
                        <GradientView
                            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                            locations={[0, 0.4, 0.7, 1]}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 280, // High enough to cover all text fields
                            }}
                        />


                        {/* 4. BOTTOM CONTENT OVERLAY */}
                        <Box className="absolute bottom-0 left-0 right-0 p-5 pb-8 z-10">
                            <VStack space="md">
                                {/* Custom Indicator Bar */}
                                <HStack space="xs" className="mb-1">
                                    {data?.images?.map((_: any, index: number) => (
                                        <Box
                                            key={index}
                                            className={`h-1 rounded-full ${activeIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                                                }`}
                                        />
                                    ))}
                                </HStack>

                                <HStack className="items-end justify-between">
                                    <VStack space="xs" className="flex-1">
                                        {/* Name & Age */}
                                        <HStack className="items-center gap-2">
                                            <Heading className="text-white text-3xl font-bold">
                                                {data?.full_name}
                                            </Heading>
                                            {data?.IsVerified === 1 && <Icon as={CheckCircleIcon} className="text-blue-400" size="sm" />}
                                        </HStack>

                                        {/* Bio Details */}
                                        <Text className="text-white text-[15px] font-medium opacity-95">
                                            {/* {formatHeight(data?.height)} {formatHeight(data?.height) && data?.sub_community_name && (
                                            <>  •  {data?.sub_community_name}</>
                                        )}

                                        {data?.community && data?.work_details && (
                                            <>  •  {data?.work_details}</>
                                        )} */}
                                            {formatHeight(data?.height)}
                                            {formatHeight(data?.height) && data?.sub_community_name ? `  •  ${data.sub_community_name}` : ''}
                                            {/* {data?.religion_name ? `  •  ${data.religion_name}` : ''} */}

                                            {data?.work_with_name ? `  •  ${data.work_with_name}` : ''}

                                        </Text>
                                        <HStack space="sm" className="flex-wrap gap-2">
                                            <Box className="bg-white/20 px-3 py-2 rounded-xl border border-white/10 flex-row items-center gap-2">
                                                <Icon as={MapPin} size="xs" className="text-cyan-300" />
                                                <Text className="text-white text-xs font-bold">{data.city_name} , {data?.state_name}</Text>
                                            </Box>
                                        </HStack>

                                    </VStack>


                                    {/* Floating Like Button */}
                                    {user?.role === 'member' && <Pressable onPress={handleLike}>
                                        <AnimatedMotiView
                                            preset="springUp"
                                            initialBackgroundColor="rgba(0,0,0,0.5)"
                                            animateBackgroundColor="#ef4444"
                                            initialScale={0.9}
                                            initialTranslateY={20}
                                        >
                                            <Icon
                                                as={HeartIcon}
                                                color="white"
                                                fill={isLiked ? "white" : "none"}
                                                size="xl"
                                            />
                                        </AnimatedMotiView>
                                    </Pressable>
                                    }
                                </HStack>
                            </VStack>
                        </Box>


                        {/* 4. Full-Screen Zoomable Gallery Modal */}
                        <Modal
                            visible={isModalVisible}
                            transparent={false}
                            animationType="fade"
                            onRequestClose={() => setIsModalVisible(false)}
                        >
                            <Box className="flex-1 bg-black">
                                {/* 1. Immersive UI Overlay */}
                                <Box
                                    style={{ zIndex: 9999, elevation: 10 }}
                                    className="absolute top-12 left-0 right-0 flex-row justify-between items-center px-6"
                                >
                                    <Box className="bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                                        <Text className="text-white font-bold text-sm">
                                            {activeIndex + 1} / {data?.images?.length}
                                        </Text>
                                    </Box>

                                    <Pressable
                                        onPress={() => {
                                            setIsModalVisible(false);
                                            setActiveIndex(0);
                                        }}
                                        hitSlop={20}
                                        className="bg-white/20 p-2.5 rounded-full "
                                    >
                                        <Icon as={CloseIcon} color="white" size="xl" />
                                    </Pressable>
                                </Box>

                                {/* 2. Pure Gallery Component (Handles Swiping & Zooming) */}
                                <Gallery
                                    data={data?.images || []}
                                    initialIndex={activeIndex}
                                    onIndexChange={setActiveIndex}
                                    onSwipeToClose={() => setIsModalVisible(false)}

                                    // Features you requested 
                                    pinchEnabled={true}       // Enables Zoom
                                    doubleTapEnabled={true}  // Double tap to Zoom

                                    // Required for stability
                                    keyExtractor={(_, index) => `img-${index}`}
                                    renderItem={({ item }: any) => (
                                        <View style={{ width: windowWidth, height: '100%', justifyContent: 'center' }}>
                                            <FastImage
                                                source={{ uri: getExtension(item.file_name || "", 'addthumnail') }}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    )}
                                />
                            </Box>
                        </Modal>
                    </Box>

                    {/* 2. About Section */}
                    <VStack className="p-4 bg-white mt-2 relative">
                        <Heading size="md" className="mb-2">About {data?.full_name}</Heading>

                        <Box className="relative">
                            <Text
                                className="text-typography-600 leading-6  text-justify"
                                numberOfLines={isExpanded ? undefined : 3}
                            >
                                {data?.aboutus}
                            </Text>

                            {/* 1. The Gradient Fade-out */}
                            {/* Only show the fade when the text is NOT expanded */}
                            {!isExpanded && (
                                <GradientView
                                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'white']}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 30, // Height of the fade effect
                                    }}
                                />
                            )}
                        </Box>

                        {/* 2. Toggle Button */}
                        {data?.aboutus && <Pressable
                            onPress={toggleExpand}
                            className="flex-row items-center justify-center mt-2 py-1"
                        >
                            <Text className="text-cyan-600 font-bold mr-1">
                                {isExpanded ? "View less" : "View more"}
                            </Text>
                            <Icon
                                as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                                size="xs"
                                className="text-cyan-600"
                            />
                        </Pressable>
                        }
                    </VStack>

                    {/* 3. Hobbies & Interests */}
                    {data?.hobbies_name && <VStack className="p-4 bg-white mt-2">
                        <Heading size="md" className="mb-4">Hobbies & Interests</Heading>

                        <HStack className="flex-wrap gap-3">
                            {data?.hobbies_name.split(',').map((item: any) => item.trim()).map((items: any, index: number) => (
                                <Box key={index} className="rounded-full overflow-hidden border border-outline-100 shadow-sm">
                                    <GradientView
                                        // Subtle transition from a very light gray to a slightly darker tint
                                        colors={['#ffffff', '#f8fafc', '#f1f5f9']}

                                    >
                                        <Box className="flex-row items-center gap-2 px-5 py-2.5">
                                            {/* You can add small icons here later for each hobby */}
                                            <Text className="text-sm font-semibold text-typography-800">
                                                {items}
                                            </Text>
                                        </Box>
                                    </GradientView>
                                </Box>
                            ))}
                        </HStack>
                    </VStack>
                    }

                    {/* 4. Basic Details Card */}

                    <Box className="mx-4 my-2 rounded-3xl overflow-hidden shadow-sm border border-cyan-100">
                        {/* 1. The Signature Cyan Gradient */}
                        <GradientView
                            colors={['#f0fdfa', '#ecfeff', '#e0f2fe']}

                            style={{ padding: 24 }}
                        >
                            {/* Header */}
                            <HStack className="justify-between items-center mb-6">
                                <Heading size="md" className="text-typography-900">Basic Details</Heading>
                                <Box className="bg-white/50 px-3 py-1 rounded-full border border-cyan-200">
                                    <Text className="text-[10px] text-cyan-700 font-bold uppercase">Public Info</Text>
                                </Box>
                            </HStack>
                            {/* Row 1: Age & Date of Birth */}

                            {/* Info Rows */}
                            <VStack space="xl">
                                <HStack className="items-center gap-4">
                                    <HStack items-center space="md" className="flex-1">
                                        <Box className="bg-white p-3 rounded-2xl shadow-sm">
                                            <Icon as={User} size="sm" className="text-cyan-600" />
                                        </Box>
                                        <VStack>
                                            <Text size="xs" className="text-typography-500 font-medium">Age</Text>
                                            <Text size="md" className="text-typography-900 font-bold">{data?.age} Years</Text>
                                        </VStack>
                                    </HStack>

                                    <HStack items-center space="md" className="flex-1">
                                        <Box className="bg-white p-3 rounded-2xl shadow-sm">
                                            <Icon as={Calendar} size="sm" className="text-cyan-600" />
                                        </Box>
                                        <VStack>
                                            <Text size="xs" className="text-typography-500 font-medium">DOB</Text>
                                            <Text size="md" className="text-typography-900 font-bold">{data?.dob}</Text>
                                        </VStack>
                                    </HStack>
                                </HStack>
                                {/* Marital Status */}
                                <HStack className="items-center gap-4">
                                    <Box className="bg-white p-3 rounded-2xl shadow-sm">
                                        <Icon as={UserIcon} size="sm" className="text-cyan-600" />
                                    </Box>
                                    <VStack className="flex-1">
                                        <Text size="xs" className="text-typography-500 font-medium">Marital Status</Text>
                                        <Text className="font-bold text-typography-900 text-base">{data?.marital_status_name}</Text>
                                    </VStack>
                                </HStack>
                                {/* CONDITIONAL Children Row */}
                                {data?.has_children === "Yes" ? (
                                    <HStack className="items-center gap-4">
                                        <Box className="bg-white p-3 rounded-2xl shadow-sm">
                                            <Icon as={UsersIcon} size="sm" className="text-cyan-600" />
                                        </Box>
                                        <VStack className="flex-1">
                                            <Text size="xs" className="text-typography-500 font-medium">Children</Text>
                                            <Text className="font-bold text-typography-900 text-base">
                                                {data?.children_count} {data?.children_count === 1 ? 'Child' : 'Children'}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                ) : (
                                    <HStack className="items-center gap-4">
                                        <Box className="bg-white p-3 rounded-2xl shadow-sm  ">
                                            <Icon as={UsersIcon} size="sm" className="text-cyan-600" />
                                        </Box>
                                        <VStack className="flex-1">
                                            <Text size="xs" className="text-typography-500 font-medium">Children</Text>
                                            <Text className="font-bold text-typography-400 text-base">No Children</Text>
                                        </VStack>
                                    </HStack>
                                )}
                                {/* Location */}
                                <HStack className="items-center gap-4">
                                    <Box className="bg-white p-3 rounded-2xl shadow-sm">
                                        <Icon as={MapPinIcon} size="sm" className="text-cyan-600" />
                                    </Box>
                                    <VStack className="flex-1">
                                        <Text size="xs" className="text-typography-500 font-medium">Lives In</Text>
                                        <Text className="font-bold text-typography-900 text-base"> {data?.city_name}, {data?.state_name}, {data?.country_name}</Text>
                                    </VStack>
                                </HStack>
                            </VStack>

                            {/* <Divider className="my-6 bg-cyan-200/50" /> */}

                            {/* 2. The Locked Section (Consistent with Contact Card) */}
                            {/* <VStack className="items-center">
                        <Box className="bg-white p-2 rounded-xl shadow-sm mb-3">
                            <Icon as={LockIcon} size="md" className="text-cyan-600" />
                        </Box>
                        <Text className="text-center text-xs text-typography-600 mb-4 leading-5 px-6">
                            To unlock Birth date, Horoscope and more details.
                        </Text>

                        <Pressable className="w-full overflow-hidden rounded-full shadow-md active:scale-95">
                            <LinearGradient
                                colors={['#0891b2', '#0e7490']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="py-3 items-center"
                            >
                                <Text className="text-white font-bold text-sm tracking-wide">
                                    GO PREMIUM NOW
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </VStack> */}
                        </GradientView>
                    </Box>

                    {/*  #region  Basic Details Card other desing*/}
                    {/* <VStack className="p-4 bg-white mt-2">
                <Heading size="md" className="mb-4">Basic Details</Heading>
                <DetailRow icon={UserIcon} label="Marital Status" value="Never Married" />
                <DetailRow icon={MapPinIcon} label="Lives In" value="Hosur, Tamil Nadu, India" />

                <Box className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-6 items-center mt-4">
                    <Icon as={LockIcon} size="xl" className="text-cyan-600 mb-2" />
                    <Text className="text-center text-sm text-typography-600 mb-4">
                        To unlock Birth date
                    </Text>
                    <Button variant="outline" className="border-cyan-500 rounded-full px-8">
                        <ButtonText className="text-cyan-600 font-bold">Go Premium Now</ButtonText>
                    </Button>
                </Box>
            </VStack> */}

                    {/*  #endregion */}

                    {/* 5. Contact Details Card (New Section) */}

                    <Box className="mx-4 my-4 rounded-3xl overflow-hidden shadow-lg border border-red-100">
                        {/* 1. Multi-stop Background Gradient */}
                        <GradientView
                            colors={['#fff5f5', '#ffffff', '#fffafa']}
                            style={{ padding: 20 }}
                        >
                            {/* Top Accent Line */}
                            <Box className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />

                            {/* Header Area */}
                            <HStack className="justify-between items-center mb-6 mt-2">
                                <Heading size="md" className="text-typography-900">Contact Details</Heading>
                                <Box className="bg-red-50 p-2 rounded-full">
                                    <Icon as={CrownIcon} size="md" className="text-red-500" />
                                </Box>
                            </HStack>

                            {/* Info Area */}
                            <VStack space="xl">
                                {/* Phone Row */}
                                <HStack className="items-center gap-4">
                                    <GradientView
                                        colors={['#ef4444', '#dc2626']}
                                        className="p-3 rounded-2xl shadow-sm"
                                    >
                                        <Icon as={PhoneIcon} size="sm" color="white" />
                                    </GradientView>
                                    <VStack className="flex-1">
                                        <Text size="xs" className="text-typography-500 font-medium">Contact No.</Text>
                                        <HStack className="items-center gap-2">
                                            <Text className="font-bold text-typography-900 text-base">{data?.phone}</Text>
                                            <Icon as={LockIcon} size="xs" className="text-red-400" />
                                        </HStack>
                                    </VStack>
                                </HStack>

                                {/* Email Row */}
                                <HStack className="items-center gap-4">
                                    <GradientView
                                        colors={['#ef4444', '#dc2626']}
                                        className="p-3 rounded-2xl shadow-sm"
                                    >
                                        <Icon as={MailIcon} size="sm" color="white" />
                                    </GradientView>
                                    <VStack className="flex-1">
                                        <Text size="xs" className="text-typography-500 font-medium">Email ID</Text>
                                        <HStack className="items-center gap-2">
                                            <Text className="font-bold text-typography-900 text-base">{data?.email}</Text>
                                            <Icon as={LockIcon} size="xs" className="text-red-400" />
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </VStack>

                            {/* <Divider className="my-6 bg-red-100" /> */}

                            {/* 2. Premium CTA Section with Gradient Button */}
                            {/* <VStack className="items-center pb-2">
                        <Text className="text-xs text-typography-600 mb-4 font-medium italic">
                            Upgrade to view verified contact details
                        </Text>

                        <Pressable className="w-full overflow-hidden rounded-full shadow-md active:scale-95">
                            <LinearGradient
                                colors={['#0891b2', '#0e7490']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="py-3 items-center"
                            >
                                <Text className="text-white font-bold text-sm">
                                    GO PREMIUM NOW
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </VStack>
                    <VStack className="items-center">
                        <Text className="text-xs text-typography-500 mb-3">To unlock Contact No. & Email ID</Text>
                        <Button variant="outline" className="border-cyan-500 rounded-full px-10">
                            <ButtonText className="text-cyan-500 font-bold">Go Premium Now</ButtonText>
                        </Button>
                    </VStack> */}

                        </GradientView>
                    </Box>

                    {/* 6. Family Details Card */}

                    {/* <Box className="mx-4 my-4 bg-white border border-outline-100 rounded-3xl shadow-sm overflow-hidden">
                     <Box className="bg-orange-400 p-4 flex-row items-center justify-center gap-3">
                        <Icon as={HomeIcon} color="white" size="lg" />
                        <Text className="text-white font-bold text-center">
                            Add your details to see {data?.full_name}'s family
                        </Text>
                    </Box>

                    <VStack className="p-5" space="md">
                        <Heading size="sm" className="text-typography-800">Family Background</Heading>


                        <VStack space="xs">
                            <DetailRow
                                icon={UsersIcon}
                                label="Family Type"
                                value={data?.family_type}
                            />
                            <DetailRow
                                icon={BriefcaseIcon}
                                label="Father's Occupation"
                                value={data?.father_occupation}
                            />
                            <DetailRow
                                icon={BriefcaseIcon}
                                label="Mother's Occupation"
                                value={data?.mother_occupation}
                            />
                             <DetailRow
                                icon={UsersIcon}
                                label="No. of Siblings"
                                value={`${data?.Noof_sibling || 0} (${data?.brother_count || 0} Brother${data?.brother_count !== 1 ? 's' : ''}, ${data?.sister_count || 0} Sister${data?.sister_count !== 1 ? 's' : ''})`}
                            />
                        </VStack>
                        <Divider className="my-2" />

                         <VStack className="items-center py-2">
                            <HStack className="items-center gap-2 mb-4">
                                <Icon as={LockIcon} size="xs" className="text-typography-400" />
                                <Text className="text-xs text-typography-500 italic">
                                    Family location is visible only to premium members
                                </Text>
                            </HStack>

                            <Button
                                variant="solid"
                                className="bg-orange-500 rounded-full px-10 active:bg-orange-600"
                            >
                                <ButtonText className="text-white font-bold">Add Family Details</ButtonText>
                            </Button>
                        </VStack>
                    </VStack>
                </Box> */}

                    <Box className="mx-4 my-4 rounded-3xl overflow-hidden shadow-sm border border-orange-100 bg-white">
                        {/* 1. Premium Orange Gradient Header */}
                        <GradientView
                            colors={['#94d693', '#75d373ff', '#52d14fff']} // Orange-400 to Orange-600

                        >
                            <HStack className="p-4 items-center justify-center gap-3">
                                <Icon as={HomeIcon} color="white" size="lg" />
                                <Text className="text-white font-bold text-center flex-1">
                                    Add your details to see {data?.full_name}'s family
                                </Text>
                            </HStack>
                        </GradientView>

                        {/* 2. Content Area with Gradient Background (Matching Basic Details) */}
                        <GradientView
                            colors={['#fffaf5', '#ffffff', '#fff7ed']} // Very subtle orange/white tint

                            style={{ padding: 20 }}
                        >
                            <Heading size="md" className="mb-4 text-typography-900">Family Background</Heading>

                            <VStack space="lg">
                                <DetailRowStyled icon={UsersIcon} label="Family Type" value={data?.family_type || 'Not Specified'} />
                                <DetailRowStyled icon={BriefcaseIcon} label="Father's Occupation" value={data?.father_occupation_name || 'Not Specified'} />
                                <DetailRowStyled icon={BriefcaseIcon} label="Mother's Occupation" value={data?.mother_occupation_name || 'Not Specified'} />
                                <DetailRowStyled icon={UsersIcon} label="No. of Siblings" value={getNoofSiblings()}
                                />
                            </VStack>

                            <Divider className="my-6 bg-orange-200/50" />

                            {/* 3. Section Lock & CTA */}
                            {/* <VStack className="items-center pb-2">
                            <HStack className="items-center gap-2 mb-4 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                <Icon as={LockIcon} size="xs" className="text-orange-500" />
                                <Text className="text-[11px] text-orange-700 font-medium italic">
                                    Family location is visible only to premium members
                                </Text>
                            </HStack>

                            <Pressable className="w-full overflow-hidden rounded-full shadow-md active:scale-95">
                                <LinearGradient
                                    colors={['#f97316', '#ea580c']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="py-3 items-center"
                                >
                                    <Text className="text-white font-bold text-sm tracking-wide">
                                        ADD FAMILY DETAILS
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </VStack> */}
                        </GradientView>
                    </Box>


                    {/* 7. Education & Career Details Card */}

                    <Box
                        className="mx-4 my-3 rounded-[32px] overflow-hidden shadow-sm"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Glass effect
                            borderWidth: 1,
                            borderColor: 'rgba(99, 102, 241, 0.1)', // Subtle indigo border
                        }}
                    >
                        {/* 1. Indigo Multi-Stop Gradient Header */}
                        <GradientView
                            colors={['#6366f1', '#4f46e5', '#4338ca']}

                        >
                            <HStack className="p-4 items-center justify-center gap-3">
                                <Box className="bg-white/20 p-1.5 rounded-lg">
                                    <Icon as={GraduationCapIcon} color="white" size="md" />
                                </Box>
                                <Text className="text-white font-bold tracking-wide">
                                    Education & Professional
                                </Text>
                            </HStack>
                        </GradientView>

                        {/* 2. Content Area */}
                        <VStack className="p-6" space="xl">
                            <Heading size="sm" className="text-indigo-900 font-bold">Professional Background</Heading>

                            <VStack space="lg">
                                <ProfessionalRow icon={GraduationCapIcon} label="Education" value={data?.qualification_name || 'Not Specified'} />
                                <ProfessionalRow icon={SchoolIcon} label="College" value={data?.college || 'Not Specified'} />

                                <Divider className="bg-indigo-100/50 my-1" />

                                <ProfessionalRow icon={BriefcaseIcon} label="Occupation" value={data?.work_with_name || 'Not Specified'} />
                                <ProfessionalRow icon={BuildingIcon} label="Employed In" value={data?.working_as || 'Not Specified'} />
                                <ProfessionalRow
                                    icon={BanknoteIcon}
                                    label="Annual Income"
                                    value={data?.income ? `${data?.income_currency || '₹'} ${data?.income_name}` : 'Not Specified'}
                                />
                            </VStack>

                            {/* 3. Income Lock Section (The "Glass" Badge) */}
                            {/* <Box className="mt-2 rounded-2xl overflow-hidden">
                            <LinearGradient
                                colors={['#f5f3ff', '#ede9fe']} // Very soft violet
                                className="p-4 items-center border border-indigo-100/50"
                            >
                                <HStack className="items-center gap-2 mb-4">
                                    <Box className="bg-white p-1 rounded-full shadow-sm">
                                        <Icon as={LockIcon} size="2xs" className="text-indigo-600" />
                                    </Box>
                                    <Text className="text-[11px] text-indigo-700 font-semibold italic">
                                        Annual income is visible to premium members
                                    </Text>
                                </HStack>

                                <Pressable className="w-full overflow-hidden rounded-full shadow-md active:scale-95">
                                    <LinearGradient
                                        colors={['#6366f1', '#4f46e5']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="py-2.5 items-center"
                                    >
                                        <Text className="text-white font-bold text-xs tracking-wider">
                                            VIEW INCOME
                                        </Text>
                                    </LinearGradient>
                                </Pressable>
                            </LinearGradient>
                        </Box> */}
                        </VStack>
                    </Box>

                    {/* 8. You and Her - Preference Match Section */}

                    {
                        user?.role === 'member' && <Box
                            className="mx-4 my-4 rounded-[32px] overflow-hidden shadow-md"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}
                        >
                            {/* 1. Dynamic Match Header */}
                            <GradientView
                                colors={['#ecfeff', '#fdf2f8']} // Light Cyan to Light Pink Mesh

                            >
                                <VStack className="p-8 items-center">
                                    <Text className="text-primary-700 font-bold text-2xl mb-6">You and {data.gender == "Female" ? 'Her' : 'Him'}</Text>

                                    <HStack className="items-center justify-center">
                                        {/* User Avatar */}
                                        <Box className="rounded-full p-1 bg-white shadow-sm">
                                            <Avatar size="2xl" className="border-2 border-white">
                                                <AvatarFallbackText>User</AvatarFallbackText>
                                                <AvatarImage source={{ uri: getExtension(user?.profileThumb ?? "", "addthumnail") }} />
                                            </Avatar>
                                        </Box>

                                        {/* Connection Badge */}
                                        <Box className="bg-white p-3 rounded-full z-10 shadow-xl border border-pink-50 -mx-5">
                                            <Icon as={ArrowLeftRightIcon} className="text-pink-500" size="sm" />
                                        </Box>

                                        {/* Target Avatar */}
                                        <Box className="rounded-full p-1 bg-white shadow-sm">
                                            <Avatar size="2xl" className="border-2 border-white">
                                                <AvatarFallbackText>Target</AvatarFallbackText>
                                                <AvatarImage source={{ uri: getExtension(data?.file_name, "addthumnail") }} />
                                            </Avatar>

                                        </Box>
                                    </HStack>

                                    {/* Match Score Badge */}
                                    {/* <Box className="mt-8 overflow-hidden rounded-full shadow-lg">
                                    <LinearGradient
                                        colors={['#0891b2', '#0e7490']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="px-8 py-2.5"
                                    >
                                        <Text className="text-white font-bold text-sm">
                                            You Match 7/10 of her Preferences
                                        </Text>
                                    </LinearGradient>
                                </Box> */}
                                </VStack>
                            </GradientView>

                            {/* 2. Preference List  Dont delete */}
                            {/* <VStack className="p-6" space="xl">
                            <PreferenceRowStyled label="Age" value="33 to 36" matched={true} />
                            <PreferenceRowStyled label="Marital Status" value="Divorced, Awaiting Divorce" matched={true} />
                            <PreferenceRowStyled label="Religion" value="Christian: Born Again, Catholic" matched={true} />
                            <PreferenceRowStyled label="Annual Income" value="INR 1 Lakh to 30 Lakh" matched={true} />
                            <PreferenceRowStyled label="Height" value={`5' 3"(160cm) to 5' 11"(180cm)`} matched={false} />

                            <Divider className="my-2 bg-gray-100" />

                            
                            <Heading size="xs" className="text-gray-400 uppercase tracking-[2px] font-bold mb-2">
                                Common Ground
                            </Heading>

                            <VStack space="md">
                                <CommonGroundStyled
                                    icon={UtensilsIcon}
                                    text="You both enjoy non-vegetarian food"
                                />
                                <CommonGroundStyled
                                    icon={MapPinIcon}
                                    text="You both live in Tamil Nadu"
                                />
                            </VStack>
                        </VStack> */}
                        </Box>}

                    {/* ActionSheet Component */}
                    <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
                        <ActionsheetBackdrop />
                        <ActionsheetContent className="bg-white rounded-t-[40px] p-0 pb-6">
                            <ActionsheetDragIndicatorWrapper className="pt-3">
                                <ActionsheetDragIndicator className="bg-outline-200 w-12" />
                            </ActionsheetDragIndicatorWrapper>

                            <VStack className="w-full" space="xs">
                                {/* 1. Header Share Section - Centered Icon & Text */}
                                {/* <VStack className="items-center py-6 border-b border-outline-50">
                                <Pressable
                                    className="items-center justify-center mb-2"
                                    onPress={
                                        async () => {
                                        try {
                                            const shareUrl = `https://agrcdev.jeasuns.com/agrcdev/php/profile/get_profile_details_by_id.php?id=${profile_id}&action=view`;

                                            await Share.share({
                                                message: `Check out ${data?.full_name}'s profile on our Matrimony App!\n\nView Profile: ${shareUrl}`,
                                            });
                                        } catch (error: any) {
                                            Alert.alert(error.message);
                                        }
                                    }}
                                >
                                    <Icon as={ShareIcon} size="xl" className="text-typography-900" />
                                    <Text className="text-typography-700 font-medium mt-2 text-lg">Share</Text>
                                </Pressable>
                            </VStack> */}

                                {/* 2. Menu Items Section */}
                                <VStack className="px-4 py-2" space="sm">

                                    {/* Hide this profile */}
                                    <ActionsheetItem
                                        onPress={handleBlock}
                                        className="flex-row items-center p-4 rounded-2xl"
                                    >
                                        <ActionsheetIcon as={BanIcon} size="lg" className="text-typography-900 mr-4" />
                                        <ActionsheetItemText className="text-typography-800 text-lg font-medium">
                                            Hide Profile
                                        </ActionsheetItemText>
                                    </ActionsheetItem>

                                    {/* Block Member */}
                                    <ActionsheetItem
                                        onPress={handleBlock}
                                        className="flex-row items-center p-4  rounded-2xl"
                                    >
                                        <ActionsheetIcon as={BanIcon} size="lg" className="text-typography-900 mr-4" />
                                        <ActionsheetItemText className="text-typography-800 text-lg font-medium">
                                            Block Profile
                                        </ActionsheetItemText>
                                    </ActionsheetItem>

                                    {/* Report Profile */}
                                    <ActionsheetItem
                                        onPress={() => setShowReportModal(true)}
                                        className="flex-row items-center p-4  rounded-2xl"
                                    >
                                        <ActionsheetIcon as={FlagIcon} size="lg" className="text-red-500 mr-4" />
                                        <ActionsheetItemText className="text-red-500 text-lg font-medium">
                                            Report Profile
                                        </ActionsheetItemText>
                                    </ActionsheetItem>

                                    <Divider className="my-4 bg-outline-100 mx-4" />

                                    {/* 3. Cancel Button - Styled as per your screen */}
                                    <Box className="px-4">
                                        <Pressable
                                            onPress={handleClose}
                                            className="bg-background-100 py-4 rounded-3xl items-center  "
                                        >
                                            <Text className="text-typography-900 font-bold text-lg">Cancel</Text>
                                        </Pressable>
                                    </Box>

                                </VStack>
                            </VStack>
                        </ActionsheetContent>
                    </Actionsheet>


                    {
                        user?.role !== 'member' &&
                        <>
                            <Box className="mx-4 my-4 bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden">
                                {/* Status Header */}
                                <Box className="bg-orange-400 p-4 flex-row items-center justify-center gap-3">
                                    <Icon as={UserIcon} color="white" size="lg" />
                                    <Text className="text-white font-bold text-center">
                                        Profile verification: {data?.full_name}
                                    </Text>
                                </Box>

                                <VStack className="p-5" space="md">
                                    <Heading size="sm" className="text-slate-800">Verification & Account Status</Heading>

                                    {/* Status Action Suite */}
                                    <VStack space="sm">

                                        {/* 1. Verify User Toggle */}
                                        <HStack className="items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <HStack space="sm" className="items-center">
                                                <Box className="bg-blue-100 p-2 rounded-full">
                                                    <Icon as={CheckCircleIcon} className="text-blue-500" size="xl" />
                                                </Box>
                                                <VStack>
                                                    <Text className="text-sm font-bold text-slate-900">Verify User</Text>
                                                    <Text className="text-[10px] text-slate-500">Enable blue badge status</Text>
                                                </VStack>
                                            </HStack>
                                            <Switch
                                                size="lg"
                                                value={data?.IsVerified === 1}
                                                onValueChange={(val) => handleToggleVerifyUser(data?.userid)}
                                            //           trackColor={{ false: "#cbd5e1", true: "#096437ff" }}
                                            />
                                        </HStack>

                                        {/* 2. Active Status Toggle */}
                                        <HStack className="items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <HStack space="sm" className="items-center">
                                                <Box className="bg-emerald-100 p-2 rounded-full">
                                                    {/* Using a Power or Activity icon for Active status */}
                                                    <Icon as={ZapIcon} className="text-emerald-500" size="xl" />
                                                </Box>
                                                <VStack>
                                                    <Text className="text-sm font-bold text-slate-900">Active Status</Text>
                                                    <Text className="text-[10px] text-slate-500">Control profile visibility</Text>
                                                </VStack>
                                            </HStack>
                                            <Switch
                                                size="lg"
                                                value={data?.IsActive === 1}
                                                onValueChange={(val) => handleToggleActiveProfile(data?.userid)}
                                            //trackColor={{ false: "#cbd5e1", true: "#096437ff" }}
                                            />
                                        </HStack>

                                    </VStack>

                                    {/* 2. Action Buttons: Photo & Contribute */}
                                    <VStack space="sm" className="mt-2">
                                        <HStack space="sm">
                                            {/* Verify Photo Button */}
                                            <Button
                                                className="flex-1 bg-indigo-500 rounded-2xl h-12 shadow-sm  "
                                                onPress={() => handleVerifyPhoto()}
                                            >
                                                <HStack space="xs" className="items-center">
                                                    <CameraIcon size={16} color="white" />
                                                    <ButtonText className="text-white font-bold text-sm">Verify Photo</ButtonText>
                                                </HStack>
                                            </Button>
                                        </HStack>

                                        {/* Main Add Details Button */}
                                        {/* <Button
                                        variant="outline"
                                        className="border-slate-200 rounded-2xl h-12 mt-2"
                                        onPress={() => handleAddDetails()}
                                    >
                                        <ButtonText className="text-slate-600 font-bold">Edit Family Details</ButtonText>
                                    </Button> */}
                                    </VStack>
                                </VStack>
                            </Box>

                            <ModalGUI
                                isOpen={isPhotoVerifyModalVisible}
                                onClose={() => setIsPhotoVerifyModalVisible(false)}
                                // 'full' size ensures the modal container occupies the entire viewport
                                size="full"
                            >
                                {/* Non-transparent, solid dark background for professional focus */}
                                <ModalBackdrop className="bg-slate-950" />

                                <ModalContent className="bg-slate-950 h-full w-full p-0 m-0 border-0">
                                    <SafeAreaView style={{ flex: 1 }} className="bg-slate-950">
                                        {/* 1. Specialized Header */}
                                        <HStack className="justify-between items-center px-6 py-4 border-b border-slate-800">
                                            <VStack>
                                                <Heading size="md" className="text-white">Photo Verification</Heading>
                                                <Text className="text-slate-400 text-xs">Viewing {data?.images.length} High-Res Assets</Text>
                                            </VStack>
                                            <Pressable
                                                onPress={() => setIsPhotoVerifyModalVisible(false)}
                                                className="bg-slate-800 p-3 rounded-2xl "
                                            >
                                                <Icon as={XIcon} color="white" size="sm" />
                                            </Pressable>
                                        </HStack>

                                        {/* 2. Full-Screen FlatList */}
                                        <Box className="flex-1 justify-center items-center">
                                            <FlatList
                                                data={data?.images || []}
                                                horizontal
                                                pagingEnabled
                                                keyExtractor={(item) => item.file_id?.toString()}
                                                showsHorizontalScrollIndicator={false}
                                                onScroll={handleScroll}
                                                scrollEventThrottle={16}
                                                snapToAlignment="start"
                                                decelerationRate="fast"
                                                // Use the full windowWidth since there is no outer padding anymore
                                                renderItem={({ item, index }) => (
                                                    <Box style={{ width: windowWidth, height: '100%', alignContent: 'center', justifyContent: 'center' }}>
                                                        {staffImageApproveRender({ item, index })}
                                                    </Box>
                                                )}
                                            />
                                        </Box>

                                        {/* 3. Bottom Utility Bar */}
                                        <Box className="px-6 py-6 border-t border-slate-800 bg-slate-900/50">
                                            <HStack className="justify-between items-center">
                                                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                    Verified
                                                </Text>
                                                <Box className="bg-blue-500/10 px-3 py-1 rounded-lg">
                                                    <Text className="text-blue-400 text-[10px] font-bold">3</Text>
                                                </Box>
                                            </HStack>
                                        </Box>
                                    </SafeAreaView>
                                </ModalContent>
                            </ModalGUI></>
                    }
                    {isLoading && <LoadingScreen />}


                    {showReportModal && <ReportProfileModal
                        isOpen={showReportModal}
                        onClose={() => setShowReportModal(false)}
                        onSubmit={onReportSubmit}
                        targetMemberName={data?.full_name}
                    />
                    }
                    {/* Bottom Spacer */}
                    <Box className="h-20" />
                </ScrollView ></Box>
    );
}

// Helper component for Detail Rows
const DetailRow = ({ icon, label, value }: any) => (
    <HStack className="items-center gap-4 py-3">
        <Box className="bg-green-100 p-2 rounded-full">
            <Icon as={icon} size="sm" className="text-green-600" />
        </Box>
        <VStack>
            <Text size="xs" className="text-typography-400">{label}</Text>
            <Text size="sm" className="font-medium text-typography-800">{value}</Text>
        </VStack>
    </HStack>
);

// Reusable Styled Row to match your "White Plate" design
const DetailRowStyled = ({ icon, label, value }: any) => (
    <HStack className="items-center gap-4">
        <Box className="bg-white p-3 rounded-2xl shadow-sm border border-green-50">
            <Icon as={icon} size="sm" className="text-green-600" />
        </Box>
        <VStack className="flex-1">
            <Text size="xs" className="text-typography-500 font-medium">{label}</Text>
            <Text className="font-bold text-typography-900 text-base">{value}</Text>
        </VStack>
    </HStack>
);

const ProfessionalRow = ({ icon, label, value }: any) => (
    <HStack className="items-center gap-4">
        <Box className="bg-white p-3 rounded-2xl shadow-sm border border-indigo-50">
            <Icon as={icon} size="sm" className="text-indigo-600" />
        </Box>
        <VStack className="flex-1">
            <Text className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">{label}</Text>
            <Text className="font-bold text-typography-900 text-[15px]">{value}</Text>
        </VStack>
    </HStack>
);

const PreferenceRowStyled = ({ label, value, matched }: any) => (
    <HStack className="justify-between items-start gap-4">
        <VStack className="flex-1">
            <Text className="text-[11px] text-gray-400 font-bold uppercase mb-0.5">{label}</Text>
            <Text className="text-gray-800 font-semibold leading-5">{value}</Text>
        </VStack>
        <Box className={`p-1 rounded-full ${matched ? 'bg-green-100' : 'bg-red-50'}`}>
            <Icon
                as={matched ? CheckIcon : CloseIcon}
                size="2xs"
                className={matched ? 'text-green-600' : 'text-red-400'}
            />
        </Box>
    </HStack>
);

// Common Ground item with "Glass" look
const CommonGroundStyled = ({ icon, text }: any) => (
    <HStack className="items-center gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
        <Box className="bg-white p-2 rounded-xl shadow-sm">
            <Icon as={icon} className="text-purple-600" size="sm" />
        </Box>
        <Text className="flex-1 text-sm font-medium text-purple-900">{text}</Text>
    </HStack>
);




