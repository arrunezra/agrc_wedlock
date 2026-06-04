import { View, Text, RefreshControl, TouchableOpacity, Pressable, Animated, FlatList, ActivityIndicator, StatusBar } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Heading, HStack, Input, InputField, InputSlot, VStack } from '@/src/components/GluestackUI';
import { Icon, Users } from '@/src/components/IconUI';
import { Check, ChevronRight, MapPin, Phone, UserX, XIcon } from 'lucide-react-native';
import { getExtension } from '@/src/utils/common';
import FastImage from '@d11/react-native-fast-image';
import StaffService from '@/src/services/StaffService';
import { SearchIcon } from '@/components/ui/icon';
import NotFoundScreen from '@/src/components/NotFoundScreen';
import HeaderSession from '@/src/components/HeaderSession';
import AnimatedMotiView from '@/src/components/AnimateView';
import GradientView from '@/src/components/GradientView';

const StaffInboxScreen = ({ navigation }: any) => {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const scaleAnim = useRef(new Animated.Value(0)).current;

    // 1. Clear Button Animation
    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: searchTerm.length > 0 ? 1 : 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7
        }).start();
    }, [searchTerm]);

    // 2. Optimized Fetch Logic with "isRefresh" logic
    const fetchData = useCallback(async (pageNum: number, isRefresh: boolean = false, currentSearch: string = searchTerm) => {
        // Prevent duplicate calls
        if (loading && !isRefresh) return;

        if (isRefresh) {
            setRefreshing(true);
            // Reset hasMore temporarily to allow the refresh to proceed
        } else {
            if (!hasMore) return;
            setLoading(true);
        }

        try {

            const res = await StaffService.fetechInboxDetails({
                page: pageNum,
                search: currentSearch,
                action: 'staff-inbox'
            });

            if (res.success) {

                const newProfiles = res.data || [];
                // Update lists
                setProfiles(prev => isRefresh ? newProfiles : [...prev, ...newProfiles]);
                setSummary(res);

                const totalMatching = res.totalMatchingProfiles || 0;
                // Calculate count based on what we are about to set
                const currentCount = isRefresh ? newProfiles.length : profiles.length + newProfiles.length;

                setHasMore(currentCount < totalMatching);
                setPage(pageNum);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }, [loading, hasMore, profiles.length, searchTerm]);

    // 3. Initial Mount - Only one call
    useEffect(() => {
        fetchData(1, true);
    }, []);

    // 4. Search Trigger (Debounced)
    useEffect(() => {
        // Don't trigger if search is empty on mount (already handled by mount effect)
        const delayDebounceFn = setTimeout(() => {
            fetchData(1, true, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const onRefresh = () => {
        // No need to setHasMore(true) here, fetchData handles it
        fetchData(1, true);
    };

    const loadMore = () => {
        // Ensure we don't load more if we are already refreshing or loading
        if (!loading && !refreshing && hasMore) {
            fetchData(page + 1);
        }
    };

    const getStatusColor = (isActive: number, isVerified: number): string => {
        if (isActive === 1 && isVerified === 1) return '#22c55e';
        if (isActive === 1 && isVerified !== 1) return '#E8AD69';
        return '#ef4444';
    };

    const renderHeader = () => (
        <VStack space="lg" className="p-4 bg-slate-50 pt-4">
            <HStack space="sm" className="items-center mt-2">
                <Input variant="rounded" className="flex-1 h-16 bg-white border-slate-100 shadow-md shadow-slate-200/50">
                    <InputSlot className="pl-5">
                        <Icon as={SearchIcon} className="text-cyan-600" size="md" />
                    </InputSlot>
                    <InputField
                        placeholder="Search name, phone number"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        className="text-lg font-semibold text-slate-800"
                    />
                    {searchTerm.length > 0 && (
                        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: scaleAnim }}>
                            <InputSlot className="pr-4">
                                <TouchableOpacity onPress={() => setSearchTerm('')} className="bg-slate-100 rounded-full p-1.5">
                                    <Icon as={XIcon} size="xl" className="text-slate-500" />
                                </TouchableOpacity>
                            </InputSlot>
                        </Animated.View>
                    )}
                </Input>
                {/* <TouchableOpacity className="w-16 h-16 bg-slate-900 rounded-3xl items-center justify-center shadow-xl">
                    <Icon as={Settings2} className="text-cyan-400" size="md" />
                </TouchableOpacity> */}
            </HStack>
            <Heading size="md" className="text-slate-900 px-1">Recent Uploads</Heading>

        </VStack>
    );

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const statusColor = getStatusColor(item.IsActive, item.IsVerified);
        return (
            <HStack className='pl-2'>
                <AnimatedMotiView
                    key={item.staff_id}
                    preset="springUp"
                    animationType="timing"
                    stiffness={150}
                    duration={450}
                    damping={15}
                    delay={index * 80}
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
                        style={{ borderLeftWidth: 8, borderLeftColor: statusColor }}
                    >
                        <VStack className="p-4">
                            {/* --- TOP SECTION: Profile & Basic Info --- */}
                            <HStack space="md" className="items-center">
                                <Box className="relative">
                                    {/* <FastImage
                                                                     source={{ uri: getExtension(item.file_name, 'addthumnail') }}
                                                                     className="h-14 w-14 rounded-2xl bg-slate-100"
             
                                                                 /> */}
                                    <FastImage
                                        source={{
                                            uri: getExtension(item.file_name, 'addthumnail'),
                                            priority: FastImage.priority.normal,
                                            cache: FastImage.cacheControl.immutable,

                                        }}

                                        style={{ width: 56, height: 56, borderRadius: 32, borderColor: '#f1f5f9' }}
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
                                        {/* EXACT POSITION FOR USERID: Top Right of the text area */}
                                        <Text className="text-[12px] font-mono text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                            #{item.userid}
                                        </Text>
                                    </HStack>
                                    <Text className="text-xs text-slate-500 font-medium">{item.email}</Text>
                                </VStack>

                                <Box className="bg-slate-50 p-2 rounded-full ml-1">
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

                            {/* --- FOOTER SECTION: The "Missing Data" Grid --- */}
                            <Box className="mt-4 pt-4 border-t border-slate-50">
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
                                            <Text style={{ color: statusColor }} className="text-[10px] font-black uppercase">
                                                {item.IsActive === 1 ? 'Active' : 'In-Active'}
                                            </Text>
                                        </Box>
                                    </VStack>
                                </HStack>
                            </Box>
                        </VStack>
                    </Pressable>
                </AnimatedMotiView>

            </HStack>
        );
    };

    return (
        <VStack className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Notifications"
                theme="sunset"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />


            <GradientView
                colors={['#4f46e5', '#7c3aed']}
                style={{ borderRadius: 32, padding: 24, marginTop: 8, marginHorizontal: 10 }}
            >
                <HStack className="justify-between items-center">
                    <VStack>
                        <Text className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Recent Uploads — Profile Photo Count</Text>
                        <Heading size="4xl" className="text-white mt-1">{summary?.summaryCount?.GlobalPendingVerifyCount || 0}</Heading>
                    </VStack>
                    <Box className="bg-white/20 p-4 rounded-3xl">
                        <Icon as={Users} className="text-white" size="xl" />
                    </Box>
                </HStack>
            </GradientView>
            {/* Header outside FlatList */}
            {renderHeader()}

            <FlatList
                data={profiles}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.userid}-${index}`}
                contentContainerStyle={profiles.length === 0 ? { flexGrow: 1 } : {}}
                // Removed stickyHeaderIndices because header is now outside
                ListEmptyComponent={(!loading && !refreshing) ? (
                    <VStack className="flex-1 justify-center  bg-white  ">
                        <NotFoundScreen title="Records not found" description="Recent Upload Profiles" />
                    </VStack>
                ) : null}
                ListFooterComponent={hasMore ? (
                    <VStack className="p-4 mb-10 items-center">
                        {loading ? <ActivityIndicator color="#6366f1" /> : null}
                    </VStack>
                ) : <Box className="h-20" />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3} // Trigger earlier for smoother feel
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                }
            />
        </VStack>
    );
};

export default StaffInboxScreen
