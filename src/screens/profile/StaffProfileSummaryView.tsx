import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, RefreshControl, Pressable, TextInput, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { Box, HStack, VStack, Text, Heading, Spinner, Center, Input, InputField, InputIcon, InputSlot } from '@/src/components/common/GluestackUI';
import { useNavigation } from '@react-navigation/native';
import { MotiView } from 'moti';
import FastImage from '@d11/react-native-fast-image';
import { ChevronRight, MapPin, Check, Search, X, Settings2, XIcon, SearchIcon } from 'lucide-react-native';
import api from '@/src/api/api';
import { Icon } from '@/src/components/common/IconUI';
import { getExtension } from '@/src/utils/common';
import HeaderSession from '../common/HeaderSession';

const StaffProfileSummaryView = () => {
    const navigation = useNavigation<any>();

    // States
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    // 1. Updated Fetch Logic to match the New PHP (POST method + Pagination)
    const fetchProfiles = useCallback(async (isSilent = false, search = '', pageNum = 0) => {
        if (!isSilent) setLoading(true);

        try {
            // CHANGED: Using POST to match PHP json_decode(file_get_contents("php://input"))
            // CHANGED: Pointing to get_staff_profiles.php
            const res = await api.post('/profile/getProfileSummary.php', {
                role: 'member',
                search: search,
                page: pageNum,
                limit: 15, // Matches the offset logic in PHP
                debug: 0
            });

            if (res.data.success) {
                // Mapping res.data.data (from PHP profiles result)
                setProfiles(res.data.data || []);
                setTotalRecords(res.data.pagination.totalRecords);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // 2. Initial Load
    useEffect(() => {
        fetchProfiles();
    }, []);

    // 3. Debounced Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProfiles(true, searchQuery, 0);
            setPage(1); // Reset page on new search
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const getStatusColor = (isActive: number, isVerified: number) => {
        if (isActive === 0) return '#f43f5e';
        if (isVerified === 1) return '#10b981';
        return '#f59e0b';
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const statusColor = getStatusColor(item.IsActive, item.IsVerified);
        return (
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 300 }}
            >
                <Pressable
                    onPress={() => navigation.navigate("Main", { screen: "ProfileDetail", params: { profile_id: item.profile_id } })}
                    className="mb-4 overflow-hidden rounded-[25px] bg-white border border-slate-100 shadow-sm"
                    style={{ borderLeftWidth: 8, borderLeftColor: statusColor }}
                >
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
                                    {/* EXACT POSITION FOR USERID: Top Right of the text area */}
                                    <Text className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
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
                                        <Text style={{ color: statusColor }} className="text-[9px] font-black uppercase">
                                            {item.IsActive === 1 ? 'Active' : 'In-Active'}
                                        </Text>
                                    </Box>
                                </VStack>
                            </HStack>
                        </Box>
                    </VStack>
                </Pressable>
            </MotiView>
        );
    };
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: searchQuery.length > 0 ? 1 : 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8
        }).start();
    }, [searchQuery]);
    return (
        <Box className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Profile Summary"
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />
            <VStack space="lg" className="p-4 bg-slate-50 ">
                <HStack space="sm" className="items-center mt-2">
                    <Input
                        variant="rounded"
                        className="flex-1 h-16 bg-white border-slate-100 shadow-md shadow-slate-200/50"
                    >
                        <InputSlot className="pl-5">
                            <Icon as={SearchIcon} className="text-cyan-600" size="md" />
                        </InputSlot>

                        <InputField
                            placeholder="Search Profile ID, Name, or Phone..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className="text-slate-700"
                        />

                        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: scaleAnim }}>
                            <InputSlot className="pr-4">
                                <TouchableOpacity
                                    onPress={() => setSearchQuery('')}
                                    className="bg-slate-100 rounded-full p-1.5"
                                >
                                    <Icon as={XIcon} size="xs" className="text-slate-500" />
                                </TouchableOpacity>
                            </InputSlot>
                        </Animated.View>
                    </Input>
                </HStack>
                {/* Result Count Badge */}
                <Box className="px-1">
                    <Text size="xs" className="text-slate-400 font-medium">
                        Found {totalRecords} registered members
                    </Text>
                </Box>
            </VStack>

            {loading && !refreshing ? (
                <Center className="flex-1"><Spinner size="large" /></Center>
            ) : (
                <FlatList
                    data={profiles}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.profile_id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchProfiles(true, searchQuery, 1);
                            }}
                        />
                    }
                    ListEmptyComponent={
                        <Center className="mt-20">
                            <SearchIcon size={48} color="#cbd5e1" />
                            <Text className="text-slate-400 mt-4 text-center">
                                {searchQuery.length > 0
                                    ? `No profiles match "${searchQuery}"`
                                    : "No members found in directory"}
                            </Text>
                        </Center>
                    }
                />
            )}
        </Box>
    );
};

export default StaffProfileSummaryView;