import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, VStack, HStack, Text, Button, ButtonText, Heading, Avatar, AvatarFallbackText,
    AvatarImage
} from '@/src/components/common/GluestackUI';
import { ChevronRight, User, UserMinus } from "lucide-react-native";
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, StatusBar } from 'react-native';
import profileService from '@/src/services/profileService';
import { useAuth } from '@/src/context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import { getExtension, getFilterConfig } from '@/src/utils/common';
import { useAlert } from '@/src/context/AlertContext';
import { useAppToast } from '@/src/context/ToastContext';
import NotFoundScreen from '../../common/NotFoundScreen';
import { Icon } from '@/components/ui/icon';
import { useNavigation } from '@react-navigation/native';
import HeaderSession from '../../common/HeaderSession';

const SummryListViewScreen = (props: any) => {
    const { filter, mode } = props?.route?.params;
    const config = getFilterConfig(filter);
    const navigation = useNavigation<any>();

    const { showAlert, hideAlert } = useAlert();
    const { showToast } = useAppToast();
    const { user } = useAuth();

    const [summary, setSummary] = useState<any>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination States
    const [offset, setOffset] = useState(0);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 20;

    const fetchSummaryDetails = async (isInitial = true) => {
        // Prevent fetching if we are already loading or there's no more data
        if (!isInitial && (!hasMore || isFetchingNextPage)) return;

        if (isInitial) {
            setIsLoading(true);
            setHasMore(true); // Reset buffet for new search/refresh
        } else {
            setIsFetchingNextPage(true);
        }

        const currentOffset = isInitial ? 0 : offset;

        const response = await profileService.fetchSummaryDetails({
            profile_id: user?.profile_id,
            role: mode || 'Profile', // Use the mode from props
            view_mode: 'LIST',
            filter_by: filter,
            limit: limit,
            offset: currentOffset
        });

        if (response.success) {
            const newItems = response?.summary?.items || [];

            // Check if we've reached the end of the data
            if (newItems.length < limit) {
                setHasMore(false);
            }

            // 1. If Initial: Replace data. 2. If Pagination: Append data.
            setSummary((prev: any) => isInitial ? newItems : [...prev, ...newItems]);

            // Update offset for the NEXT call
            setOffset(currentOffset + limit);
        }

        setIsLoading(false);
        setIsFetchingNextPage(false);
    };

    // --- Lifecycle ---
    useEffect(() => {
        fetchSummaryDetails(true);
    }, [filter]); // Re-fetch if filter changes

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSummaryDetails(true);
        setRefreshing(false);
    }, [filter]);
    const handleProfileAction = (targetId: any, targetName: any) => {
        const { buttonText } = getFilterConfig(filter);
        showAlert({
            type: 'success',
            title: `${buttonText} User?`,
            message: `Are you sure you want to ${buttonText.toLowerCase()} ${targetName}?`,
            confirmText: buttonText,
            onConfirm: async () => {
                hideAlert();
                // filter means
                // 1. accepted
                // 2. rejected
                // 3. requests
                // 4. likes  

                let action = filter;
                if (filter == "Accepted") {
                    action = 'disconnect';
                } else if (filter == "Requests") {
                    action = 'accepted';
                } else if (filter == "Likes") {
                    action = 'likes';
                } else if (filter == "Views") {
                    action = 'views';
                }
                else action = filter;
                try {
                    let body = {
                        action: action,
                        target_id: targetId
                    };
                    // console.log('body', body);
                    const res = await profileService.handle_interest_block_actions(body);

                    if (res.success) {
                        showToast("Success", `${targetName} action: ${filter} completed.`, "success");

                        // 🔥 THE KEY ADDITION: Update local state so the item disappears
                        setSummary((prev: any) => prev.filter((item: any) => item.profile_id !== targetId));

                    } else {
                        showToast("Error", `Something went wrong`, "error");
                    }
                } catch (err) {
                    console.error(err);
                    showToast("Error", "Server connection failed", "error");
                }
            }
        });
    };

    const renderView = () => {

    }
    return (
        <Box className="flex-1 bg-white">
            <StatusBar barStyle="light-content" backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title={filter}
                theme="emerald"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />
            <Box className="flex-1 bg-white p-4">


                {/* 1. Header Logic */}
                {summary.length !== 0 && (
                    <Heading size="lg" className="mb-4">{config.title}</Heading>
                )}

                {/* 2. Main Conditional Content */}
                {summary.length === 0 && !refreshing && !isLoading ? (
                    // EMPTY STATE
                    <ScrollView
                        contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        <NotFoundScreen
                            title={`No ${filter} found.`}
                            description={`No profiles here yet. When there are ${filter}, they’ll appear here.`}
                        />
                    </ScrollView>
                ) : (
                    // DATA STATE (Nested Ternary: Loading OR FlatList)
                    <>
                        {isLoading ? (
                            <ProfileListSkeleton />
                        ) : (
                            <FlatList
                                data={summary || []}
                                keyExtractor={(item: any) => item.profile_id.toString()}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={['#10b981']}
                                        tintColor={'#10b981'}
                                    />
                                }
                                onEndReached={() => fetchSummaryDetails(false)} // This triggers the append logic
                                onEndReachedThreshold={0.5}
                                renderItem={({ item }) => (

                                    <LinearGradient
                                        colors={['#ffffff', '#f4faf8', '#defbf1']} // Clean transition from pure white to soft mint green
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }} // Horizontal gradient across the card layout
                                        style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }} // Native border style execution
                                    >
                                        {/* Internal row arrangement framework container */}
                                        <HStack className="justify-between items-center p-4 bg-transparent">
                                            <Pressable
                                                className="flex-1"
                                                onPress={() => {
                                                    navigation.navigate('ProfileDetail', { profile_id: item.profile_id, module: 'summary' })
                                                }}
                                            >
                                                <HStack space="lg" className="items-center">
                                                    <Avatar size="xl" className="border border-slate-100 shadow-sm">
                                                        <AvatarFallbackText>{item.full_name}</AvatarFallbackText>
                                                        <AvatarImage source={{ uri: getExtension(item.file_name, 'addthumnail') }} />
                                                    </Avatar>

                                                    <VStack className="flex-1" space="xs">
                                                        <Text size="xl" className="font-bold text-slate-900">{item.full_name}</Text>
                                                        {/* Dynamic Sub-text based on Filter */}
                                                        <Text size="sm" className="text-slate-600 font-medium">{item.city_name || config.subText}</Text>
                                                    </VStack>
                                                </HStack>
                                            </Pressable>

                                            {/* 1. Show Date/Time ONLY for Profile Visitors */}
                                            {config?.title == 'Profile Visitors' && (
                                                <VStack className="items-end ml-2 bg-white/60 px-2.5 py-1.5 rounded-xl border border-slate-200/40">
                                                    <Text size="xs" className="text-slate-700 font-bold">
                                                        {item.sub_text ?
                                                            new Intl.DateTimeFormat('en-GB', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            }).format(new Date(item.sub_text)).replace(/ /g, '-')
                                                            : ''
                                                        }
                                                    </Text>
                                                    <Text size="xs" className="text-slate-500 font-medium mt-0.5">
                                                        {item.sub_text ?
                                                            new Date(item.sub_text).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            }) : ''
                                                        }
                                                    </Text>
                                                </VStack>
                                            )}

                                            {/* 2. Dynamic Action Button ONLY for other views (Liked/Connected) */}
                                            {config?.title != 'Profile Visitors' && (
                                                <Box className="ml-2 shadow-sm shadow-emerald-900/10">
                                                    <Pressable onPress={() => handleProfileAction(item.profile_id, item.full_name)}>
                                                        <LinearGradient
                                                            colors={config.buttonColors || ['#047857', '#065f46']}
                                                            style={{
                                                                borderRadius: 12,
                                                                paddingHorizontal: 16,
                                                                paddingVertical: 9,
                                                                minWidth: 95,
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Text className="text-white font-bold text-xs tracking-wide">
                                                                {config.buttonText}
                                                            </Text>
                                                        </LinearGradient>
                                                    </Pressable>
                                                </Box>
                                            )}
                                        </HStack>
                                    </LinearGradient>
                                )


                                }
                            />
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};


export default SummryListViewScreen


const SkeletonItem = () => {
    // 2026 Design: Using a subtle slate-200 base with rounded-full for the 'pulse' effect
    return (
        <HStack className="justify-between items-center p-3 border-b border-outline-100 opacity-60">
            <HStack space="md" className="flex-1 items-center">
                {/* Avatar Skeleton */}
                <Box className="w-24 h-24 rounded-full bg-slate-200 animate-pulse" />

                <VStack space="xs" className="flex-1">
                    {/* Name Skeleton */}
                    <Box className="w-32 h-4 rounded-md bg-slate-200" />
                    {/* Location Skeleton */}
                    <Box className="w-24 h-3 rounded-md bg-slate-100" />
                </VStack>
            </HStack>

            {/* Action Button Skeleton (Matched to your Unblock button size) */}
            <Box className="w-20 h-8 rounded-xl bg-slate-100" />
        </HStack>
    );
};

export const ProfileListSkeleton = () => {
    return (
        <VStack>
            {[1, 2, 3, 4, 5, 6].map((key) => (
                <SkeletonItem key={key} />
            ))}
        </VStack>
    );
};