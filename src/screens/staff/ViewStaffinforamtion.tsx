import { Avatar, AvatarFallbackText, AvatarImage, Badge, Box, Button, ButtonText, Center, Heading, HStack, VStack } from '@/src/components/GluestackUI';
import StaffService from '@/src/services/StaffService';
import { ChevronRight, Church, Edit3, Edit3Icon, Hexagon, Home, Mail, MapPin, Navigation, Smartphone, UserCheck } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Linking, StatusBar } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useAuth } from '@/src/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { getExtension, getFullName } from '@/src/utils/common';
import AnimatedMotiView from '@/src/components/AnimateView';
import { Hash, Icon, Phone, User } from '@/src/components/IconUI';
import HeaderSession from '@/src/components/HeaderSession';
import NotFoundScreen from '@/src/components/NotFoundScreen';
import LoadingScreen from '@/src/components/LoadingScreen';
import GradientView from '@/src/components/GradientView';
const InfoRow = ({ label, value, icon: IconComponent, color = "#0891b2", isMultiline = false }: any) => (
    <HStack className="items-center gap-5 py-2">
        {/* Icon with soft tinted background */}
        <Box
            style={{ backgroundColor: `${color}10` }}
            className="h-12 w-12 items-center justify-center rounded-2xl border border-slate-100"
        >
            <Icon as={IconComponent} size="sm" style={{ color: color }} />
        </Box>

        <VStack className="flex-1">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[1.5px] mb-0.5">
                {label}
            </Text>
            <Text
                className={`text-slate-900 font-bold ${isMultiline ? 'text-sm leading-5' : 'text-base'}`}
            >
                {value || "Not Set"}
            </Text>
        </VStack>

        <Icon as={ChevronRight} size="xs" className="text-slate-300" />
    </HStack>
);
const GlassTile = ({ label, value }: any) => (
    <Box className="bg-slate-50 border border-slate-100 p-5 rounded-[24px]">
        <VStack>
            <Text className="text-cyan-600 text-[9px] font-black uppercase tracking-widest mb-1">
                {label}
            </Text>
            <Text className="text-slate-800 text-base font-extrabold tracking-tight">
                {value || "Not Specified"}
            </Text>
        </VStack>
    </Box>
);
const ViewStaffinforamtion = ({ navigation, route }: any) => {
    const { id } = route.params; // Get the ID from navigation
    const { user } = useAuth();

    //console.log('ViewStaffinforamtion id=', id);
    const [formData, setFormData] = useState({
        id: id,
        firstName: '',
        lastName: '',
        staffId: '',
        department: '',
        designation: '',
        church_id: '',
        mobileNo: '',
        email: '',
        address: '',
        role: '',
        joiningDate: new Date(),
        joiningDateLabel: '',
        altMobileNo: '',
        state: null,
        city: null,
        selected_pastor: '',
        selected_address: '',
        church_name: '',
        alrenativeMobileNo: '',
        city_name: '',
        state_name: '',
        church_address: '',
        pastor_name: '',
        updated_at: '',
        activeStatus: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>('');

    useFocusEffect(
        useCallback(() => {
            //console.log(getExtension(user?.profilePic, 'url'))
            setProfile("")
        }, [])
    );
    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                setIsLoading(true);
                const response = await StaffService.fetchStaffById(id);
                console.log('fetchStaffById', response);
                if (response) {
                    setFormData(response.data);
                }
            } catch (error) {
                console.error('Error fetching staff data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStaffData();
    }, [id]);
    if (isLoading) {
        return <LoadingScreen />
    }
    if (!formData) return <NotFoundScreen />
    const cleanName = getFullName(formData?.firstName, formData?.lastName);
    return (
        <Box className="flex-1 bg-[#f8fafc]">
            {/* 1. Status Bar Setup */}
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 2. Unified Header Section */}
            <HeaderSession
                title="Staff Details"
                theme="cyan" // Changed to match your primary body theme color perfectly
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()}
            />

            <KeyboardAwareScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* 3. Hero Avatar Section with Gradient Background */}
                <Box className="relative pt-8 pb-20 items-center justify-center">
                    <GradientView
                        colors={['#0097b2', '#00bcd4', '#f8fafc']}
                        className="absolute inset-0"
                    />

                    <VStack className="items-center z-10">
                        {/* Perfect Round Profile Ring container frame */}
                        <Box className="h-32 w-32 rounded-full bg-transparent shadow-2xl shadow-cyan-950/50 border-[3px] border-white relative items-center justify-center">
                            <Avatar className="h-full w-full rounded-full bg-cyan-700">
                                <AvatarFallbackText className="font-black text-2xl text-white">
                                    {cleanName}
                                </AvatarFallbackText>

                                <AvatarImage
                                    source={{ uri: "" }}
                                    className="h-full w-full rounded-full"
                                />

                            </Avatar>

                            {/* Status Indicator Dot badge */}
                            <Box
                                className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white z-20 ${formData?.activeStatus === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                            />
                        </Box>

                        {/* Staff Profile Text Identity block */}
                        <VStack className="items-center mt-4 px-4">
                            <Heading className="text-[26px] text-slate-900 font-black tracking-tight text-center">
                                {cleanName}
                            </Heading>
                            {formData?.designation && (
                                <Box className="bg-cyan-900/10 px-3 py-1 rounded-full mt-1.5">
                                    <Text className="text-cyan-700 font-extrabold uppercase text-[11px] tracking-[2px]">
                                        {formData.designation}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </VStack>
                </Box>

                {/* 4. Content Area Layout Blocks */}
                <VStack className="px-5 gap-6 -mt-12 pb-36">

                    {/* Contact Identity Info Card Container */}
                    <Box className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-100/80">
                        <VStack className="gap-5">
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (formData?.mobileNo) Linking.openURL(`tel:${formData.mobileNo}`);
                                }}
                            >
                                <InfoRow label="Primary Mobile" value={formData?.mobileNo || "Not Available"} icon={Phone} color="#0891b2" />
                            </TouchableOpacity>

                            {formData?.alrenativeMobileNo && (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => Linking.openURL(`tel:${formData.alrenativeMobileNo}`)}
                                >
                                    <InfoRow label="Alternative Mobile" value={formData.alrenativeMobileNo} icon={Smartphone} color="#0d9488" />
                                </TouchableOpacity>
                            )}

                            <InfoRow
                                label="Location"
                                value={formData?.city_name ? `${formData.city_name}, ${formData.state_name || ''}` : "Not Set"}
                                icon={MapPin}
                                color="#4f46e5"
                            />

                            <InfoRow
                                label="Residential Address"
                                value={formData?.address || "No Address Provided"}
                                icon={Home}
                                color="#64748b"
                                isMultiline
                            />
                        </VStack>
                    </Box>

                    {/* Church Corporate Affiliation Details Card Component */}
                    <Box className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/60 border border-slate-100/80">
                        <HStack className="items-center gap-3 mb-5">
                            <Center className="bg-cyan-500 w-9 h-9 rounded-xl">
                                <Icon as={Church} size="sm" className="text-white" />
                            </Center>
                            <Text className="text-slate-900 font-black text-lg tracking-tight">Church Details</Text>
                        </HStack>

                        <VStack className="gap-3.5">
                            <GlassTile label="Church Name" value={formData?.church_name || "Unassigned"} />
                            <GlassTile label="Pastor Name" value={formData?.pastor_name || "Unassigned"} />
                            <GlassTile label="Branch Address" value={formData?.church_address || "Unassigned"} />
                        </VStack>
                    </Box>
                </VStack>
            </KeyboardAwareScrollView>

            {/* 5. Sleek Floating Action Button (FAB) */}

            <AnimatedMotiView
                preset="springUp"
                stiffness={150}
                damping={15}
                initialTranslateY={20}
                initialScale={0.9}
                delay={400}
                className="absolute bottom-8 right-8"

            >

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate("Main", {
                        screen: "StaffRegistration",
                        params: { id: id, isEdit: true }
                    })}
                    // Added rounded-full and overflow-hidden here
                    className="h-16 w-16 rounded-full overflow-hidden shadow-2xl shadow-cyan-500/50"
                    style={{ elevation: 10 }}
                >
                    <GradientView
                        colors={['#0891b2', '#0b5a70ff']}
                        // Ensure the gradient also has rounded-full
                        className="h-full w-full rounded-full items-center justify-center"
                    >
                        <Icon as={Edit3} size="lg" className="text-cyan-400" />
                    </GradientView>
                </TouchableOpacity>
            </AnimatedMotiView>
        </Box>
    );
};


export default ViewStaffinforamtion;
