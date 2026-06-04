import { View, Text, RefreshControl, TouchableOpacity, Pressable, StatusBar } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Box, Heading, HStack, Image, VStack } from '@/src/components/GluestackUI';
import { Icon, UserCheck, Users, CheckCircle } from '@/src/components/IconUI';
import { AlertCircle, ArrowUpRight, Check, ChevronRight, MapPin, Phone, UserX } from 'lucide-react-native';
import DashboardSkeleton from '../staff/DashboardSkeleton';
import profileService from '@/src/services/profileService';
import { getExtension } from '@/src/utils/common';
import FastImage from '@d11/react-native-fast-image';
import HeaderSession from '@/src/components/HeaderSession';
import AnimatedMotiView from '@/src/components/AnimateView';
import GradientView from '@/src/components/GradientView';

const ProfileSummary = ({ navigation }: any) => {
    const [data, setData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await profileService.getDashboardData();

            if (res.success) setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    }, []);
    const getStatusColor = (isActive: number, isVerified: number): string => {
        // Active and verified
        if (isActive === 1 && isVerified === 1) {
            //return isVerified === 0 ? '#3b82f6' : '#22c55e'
            return '#22c55e'

        }

        // Active but not verified
        if (isActive === 1 && isVerified !== 1) return '#E8AD69';

        // Inactive
        if (isActive === 0) return '#ef4444'; // Red

        // Default fallback (should rarely hit this)
        return '#E8AD69';
    };
    return (
        <VStack className="flex-1 bg-white">
            {/* 1. Global Status Settings (Top Level) */}
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Profile summary"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()}
                showLogo={true}
            />
            <KeyboardAwareScrollView
                className="flex-1 bg-slate-50 p-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchDashboardData} tintColor="#6366f1" />
                }
            >
                <VStack space="xl" className="pb-10">

                    {/* --- HEADER: Total Users --- */}

                    <GradientView
                        colors={['#05492bff', '#3cba92']}
                        horizontal={true}
                        style={{ borderRadius: 32, padding: 24, shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10 }}>
                        <HStack className="justify-between items-center">
                            <VStack>
                                <Text className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Global Profiles</Text>
                                <Heading size="4xl" className="text-white mt-1">{data?.summary?.total_count || 0}</Heading>
                                <Text className="text-indigo-200 text-xs mt-1">Total Registered profiles</Text>
                            </VStack>
                            <Box className="bg-white/20 p-4 rounded-3xl">
                                <Icon as={Users} className="text-white" size="xl" />
                            </Box>
                        </HStack>
                    </GradientView>

                    {/* --- STATS GRID: Active/Inactive & Verified/Unverified --- */}


                    <Box className="px-4 mb-6">
                        <HStack space="md" className="flex-wrap justify-between">
                            {[
                                { label: 'Active', count: data?.summary?.active_count || 0, colors: ['#10b981', '#059669'], icon: UserCheck },
                                { label: 'Inactive', count: data?.summary?.inactive_count || 0, colors: ['#f43f5e', '#e11d48'], icon: UserX },
                                { label: 'Verified', count: data?.summary?.verified_count || 0, colors: ['#3b82f6', '#2563eb'], icon: CheckCircle },
                                { label: 'Pending', count: data?.summary?.unverified_count || 0, colors: ['#f59e0b', '#d97706'], icon: AlertCircle }
                            ].map((item, index) => (
                                <AnimatedMotiView
                                    key={item.label}
                                    preset="springUp"
                                    stiffness={150}
                                    damping={15}
                                    initialTranslateY={20}
                                    initialScale={0.9}
                                    delay={index * 100}
                                    style={{ width: '48%', marginBottom: 16 }}

                                >

                                    <Box>
                                        <GradientView
                                            colors={item.colors}
                                            horizontal={true}
                                            style={{
                                                borderRadius: 25,
                                                padding: 20,
                                                elevation: 8,
                                                shadowColor: item.colors[0],
                                                shadowOpacity: 0.25,
                                                shadowRadius: 10
                                            }}
                                        >

                                            {/* Upper Content Row */}
                                            <HStack className="justify-between items-start mb-4">
                                                <Box className="bg-white/20 p-2 rounded-xl">
                                                    <Icon as={item.icon} size="md" color="white" />
                                                </Box>
                                                <Icon as={ArrowUpRight} size="sm" className="text-white/70" />
                                            </HStack>

                                            {/* Lower Split Metrics Value Row */}
                                            <HStack className="justify-between items-end mt-2 w-full">
                                                {/* Left-aligned Label Name */}
                                                <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest flex-1" numberOfLines={1}>
                                                    {item.label}
                                                </Text>

                                                {/* Right-aligned Statistics Figure */}
                                                <Heading size="xl" className="text-white font-black text-right ml-2">
                                                    {item.count}
                                                </Heading>
                                            </HStack>
                                        </GradientView>
                                    </Box>
                                </AnimatedMotiView>
                            ))}
                        </HStack>
                    </Box>

                    {/* --- RECENT USERS LIST --- */}
                    <VStack space="md">
                        <HStack className="justify-between items-center px-1 mb-4">
                            <Heading size="md" className="text-slate-900 font-bold tracking-tight">
                                Recent Profiles
                            </Heading>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('staffProfileSummaryView')}
                                activeOpacity={0.7}
                            >
                                <Box className="bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100/50">
                                    <HStack space="xs" className="items-center">
                                        <Text className="text-indigo-600 font-bold text-md">View All</Text>
                                        {/* Adding a small chevron makes it look more clickable */}
                                        <Icon as={ChevronRight} size="xs" className="text-indigo-600" />
                                    </HStack>
                                </Box>
                            </TouchableOpacity>
                        </HStack>

                        {refreshing || !data ? (
                            <DashboardSkeleton />
                        ) : (
                            data?.profile?.map((item: any, index: number) => {
                                const statusColor = getStatusColor(item.IsActive, item.IsVerified);

                                return (

                                    <AnimatedMotiView
                                        key={item.userid}
                                        preset="springUp"
                                        animationType="timing"
                                        stiffness={150}
                                        duration={450}
                                        damping={15}
                                        delay={index * 50}
                                        initialTranslateY={15}
                                        initialScale={0.9}
                                    >
                                        <Pressable
                                            onPress={() => {
                                                navigation.navigate("Main", {
                                                    screen: "ProfileDetail",
                                                    params: { profile_id: item.profile_id }
                                                })
                                            }}
                                            className="mb-4 overflow-hidden rounded-[30px] bg-white border border-slate-100 shadow-sm"
                                            // Kept your status identifier left-accent border strip active here
                                            style={{ borderLeftWidth: 8, borderLeftColor: statusColor }}
                                        >
                                            {/* INJECTED THE GRADIENT BACKDROP CARRIER LAYER HERE */}

                                            <GradientView
                                                colors={['#e6f4f1', '#ffffff']}
                                                horizontal={true}

                                            >
                                                {/* Balanced the padding bounds across the content component */}
                                                <VStack className="p-4">
                                                    {/* --- TOP SECTION: Profile & Basic Info --- */}
                                                    <HStack space="md" className="items-center">
                                                        <Box className="relative">
                                                            <FastImage
                                                                source={{
                                                                    uri: getExtension(item.file_name, 'addthumnail'),
                                                                    priority: FastImage.priority.normal,
                                                                    cache: FastImage.cacheControl.immutable,
                                                                }}
                                                                style={{ width: 56, height: 56, borderRadius: 32 }}
                                                                resizeMode={FastImage.resizeMode.cover}
                                                            />

                                                            {item.IsVerified === 1 && (
                                                                <Box className="absolute -right-2 -top-2 bg-blue-500 rounded-full p-1 border-2 border-white">
                                                                    <Check size={10} color="white" />
                                                                </Box>
                                                            )}
                                                        </Box>

                                                        <VStack className="flex-1">
                                                            <HStack className="justify-between items-start">
                                                                <Text className="font-bold text-slate-900 text-lg leading-tight flex-1" numberOfLines={1}>
                                                                    {item.full_name || `${item.first_name} ${item.last_name}`}
                                                                </Text>
                                                                <Text className="text-[10px] font-mono text-slate-400 bg-white/60 px-1.5 py-0.5 rounded border border-slate-200/50">
                                                                    #{item.userid}
                                                                </Text>
                                                            </HStack>
                                                            <Text className="text-xs text-slate-500 font-medium">{item.email}</Text>
                                                        </VStack>

                                                        <Box className="bg-white/60 p-2 rounded-full ml-1 border border-slate-200/40">
                                                            <ChevronRight size={16} color="#94a3b8" />
                                                        </Box>
                                                    </HStack>

                                                    {/* --- MIDDLE SECTION: The Address/Location --- */}
                                                    <HStack className="mt-3 items-center space-x-1">
                                                        <MapPin size={12} color="#64748b" />
                                                        <Text className="text-[11px] text-slate-500 flex-1" numberOfLines={1}>
                                                            {item.address}, {item.city_name}, {item.state_name}
                                                        </Text>
                                                    </HStack>

                                                    {/* --- FOOTER SECTION: Data Summary Details --- */}
                                                    {/* Softened border lines to blend seamlessly on top of the subtle gradient backgrounds */}
                                                    <Box className="mt-4 pt-4 border-t border-slate-200/40">
                                                        <HStack className="justify-between flex-wrap">
                                                            {/* DOB & Gender */}
                                                            <VStack className="w-[30%]">
                                                                <Text className="text-[9px] uppercase font-bold text-slate-400">Identity</Text>
                                                                <Text className="text-[11px] text-slate-700 font-semibold">{item.dob}</Text>
                                                                <Text className="text-[10px] text-slate-500">{item.gender}</Text>
                                                            </VStack>

                                                            {/* Contact */}
                                                            <VStack className="w-[35%]">
                                                                <Text className="text-[9px] uppercase font-bold text-slate-400">Contact</Text>
                                                                <Text className="text-[11px] text-slate-700 font-semibold">{item.phone}</Text>
                                                                <Text className="text-[10px] text-slate-500">{item.marital_status}</Text>
                                                            </VStack>

                                                            {/* Account Status */}
                                                            <VStack className="w-[30%] items-end">
                                                                <Text className="text-[9px] uppercase font-bold text-slate-400">Status</Text>
                                                                <Box
                                                                    style={{ backgroundColor: `${statusColor}15` }}
                                                                    className="px-2 py-0.5 rounded-md mt-0.5"
                                                                >
                                                                    <Text style={{ color: statusColor }} className="text-[9px] font-black uppercase">
                                                                        {item.IsActive === 1 ? 'Active' : 'In-Active'}
                                                                    </Text>
                                                                </Box>
                                                            </VStack>
                                                        </HStack>
                                                    </Box>
                                                </VStack>
                                            </GradientView>
                                        </Pressable>
                                    </AnimatedMotiView>
                                );
                            })
                        )}
                    </VStack>
                </VStack>
            </KeyboardAwareScrollView >
        </VStack>
    );
};

export default ProfileSummary
