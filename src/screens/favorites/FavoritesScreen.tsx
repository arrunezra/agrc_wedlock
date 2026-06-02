import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StatusBar } from 'react-native';

import { Box, HStack, Text, Center, Spinner, VStack, Button, ButtonText, Avatar, AvatarImage } from '@/src/components/common/GluestackUI';
import profileService from '@/src/services/profileService';
import { ProfileCard } from '../profile/ProfileCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from '@/src/components/common/IconUI';
import { Heart, HeartIcon, Star } from 'lucide-react-native';
import { StarIcon } from '@/components/ui/icon';
import NotFoundScreen from '../common/NotFoundScreen';
import { ScrollView } from 'react-native-gesture-handler';
import { getExtension } from '@/src/utils/common';
import HeaderSession from '../common/HeaderSession';
import { CaptureProtection } from 'react-native-capture-protection';

const FavoritesScreen = () => {
    // 1. Add a safety check for navigation
    const navigation = useNavigation<any>();

    const [activeTab, setActiveTab] = useState('liked');
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentViewers, setRecentViewers] = useState([]);

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
    const loadData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await profileService.getFavorites(activeTab);
            //console.log(`Data for ${activeTab}:`, res.data); // CHECK THIS IN YOUR TERMINAL
            if (res && res.success) {
                setProfiles(res.data || []);
                setRecentViewers(res.recent_viewers || []);
            }
        } catch (error) {
            // console.error("Load Favorites Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useFocusEffect(
        useCallback(() => {
            // 2. ONLY run if navigation exists
            if (navigation) {
                loadData(true);
            }
        }, [activeTab, navigation])
    );


    const handleTabChange = (tab: string) => {
        setProfiles([]); // Clear current list to prevent render conflicts
        setActiveTab(tab);
    };
    return (
        <Box className="flex-1 bg-background-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="My Shortlist"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()}
                showLogo={false} />
            {loading && profiles.length === 0 ? (
                <Center className="flex-1">
                    <Spinner size="large" />
                    <Text className="mt-2">Loading...</Text>
                </Center>
            ) : <>
                {/* Button start */}
                <Box className="px-5 py-4 bg-white border-b border-outline-100 shadow-sm">
                    <HStack className="bg-secondary-100 p-1 rounded-full items-center justify-center">

                        {/* LIKED TAB (Emerald Green Active) */}
                        <Pressable
                            className="flex-1" // Ensures equal width
                            onPress={() => handleTabChange('liked')}
                        >
                            {activeTab === 'liked' ? (
                                <LinearGradient
                                    // Using your specific green palette
                                    colors={['#10b981', '#059669', '#047857']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="rounded-full"
                                    style={{
                                        borderRadius: 999, // High number ensures it's always "full"
                                        padding: 4,
                                        overflow: 'hidden' // Critical for keeping the gradient inside the circle
                                    }}
                                >
                                    <HStack className="py-2.5 items-center justify-center gap-2">
                                        <Box className="bg-white/20 p-1 rounded-full">
                                            <Icon as={StarIcon} color="white" size="lg" />
                                        </Box>
                                        <Text className="text-white font-bold text-sm tracking-wide">
                                            {"Liked"}
                                        </Text>
                                    </HStack>
                                </LinearGradient>
                            ) : (
                                // Inactive State for Liked
                                <HStack className="py-2.5 items-center justify-center gap-2 rounded-full">
                                    <Icon as={StarIcon} color="#1b1d1fff" size="lg" />

                                    <Text className="text-secondary-400 font-semibold text-sm " style={{ color: "#181a1dff" }}>
                                        {"Liked"}
                                    </Text>
                                </HStack>
                            )}
                        </Pressable>

                        {/* Separator - Subtle line between tabs for definition */}
                        {activeTab !== 'liked' && activeTab !== 'accepted' && (
                            <Box className="h-4 w-px bg-secondary-200" />
                        )}

                        {/* MATCHES TAB (Wine Red Active) */}
                        <Pressable
                            className="flex-1" // Ensures equal width
                            onPress={() => handleTabChange('accepted')}
                        >
                            {activeTab === 'accepted' ? (
                                <LinearGradient
                                    colors={['#be123c', '#9f1239', '#881337']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    // 1. Use className for layout
                                    className="rounded-full items-center justify-center"
                                    // 2. Use style for the actual rounding to ensure clipping
                                    style={{
                                        borderRadius: 999, // High number ensures it's always "full"
                                        padding: 5,
                                        overflow: 'hidden' // Critical for keeping the gradient inside the circle
                                    }}
                                >
                                    <HStack className="py-2.5 items-center justify-center gap-2">
                                        <Box className="bg-white/20 p-1 rounded-full">
                                            <Icon as={HeartIcon} color="white" size="lg" />
                                        </Box>
                                        <Text
                                            className="text-white font-bold text-sm tracking-tight"
                                            numberOfLines={1} // Forces text to stay in one row
                                            ellipsizeMode="tail"
                                        >
                                            {"Connected"}
                                        </Text>
                                    </HStack>
                                </LinearGradient>
                            ) : (
                                // Inactive State for Matches
                                <HStack className="py-2.5 items-center justify-center gap-2 rounded-full">
                                    <Icon as={HeartIcon} color="#181a1dff" size="lg" />
                                    <Text className="text-secondary-400 font-semibold text-sm " style={{ color: "#181a1dff" }}>
                                        {"Connected"}
                                    </Text>
                                </HStack>
                            )}
                        </Pressable>

                    </HStack>
                </Box>
                {/* Button End */}
                <ScrollView
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                    contentContainerStyle={{ paddingBottom: 50 }}
                >
                    {/* 2. RECENT VIEWERS (Always Loads if present) */}
                    {recentViewers.length > 0 && (
                        <Box className="bg-white py-4 mb-4">
                            <Text className="px-5 mb-3 font-bold text-slate-800">Recently Viewed You</Text>
                            <FlatList
                                horizontal
                                data={recentViewers}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(v: any) => v.profile_id.toString()}
                                contentContainerStyle={{ paddingHorizontal: 20 }}
                                renderItem={({ item }) => (
                                    <Pressable className="mr-4 items-center" onPress={() => navigation.navigate('ProfileDetail', { profile_id: item.profile_id })}>
                                        <Avatar size="xl" className="border-2 border-emerald-400">
                                            <AvatarImage source={{ uri: getExtension(item.file_name, 'addthumnail') }} />
                                        </Avatar>
                                        <Text size="xs" className="mt-1 font-medium">{item.full_name.split(' ')[0]}</Text>
                                    </Pressable>
                                )}
                            />
                        </Box>
                    )}

                    {/* 3. VERTICAL LIST OR NOT FOUND */}
                    <Box className="px-5">
                        <Text className="mb-4 font-bold text-slate-800 text-lg">
                            {activeTab === 'liked' ? "Your Shortlist" : "Active Connections"}
                        </Text>

                        {profiles.length > 0 ? (
                            profiles.map((item: any) => (
                                <ProfileCard key={item.profile_id}
                                    profile={item}
                                    onPress={() => navigation.navigate('ProfileDetail', { profile_id: item.profile_id })}
                                    onActionComplete={() => loadData(true)}
                                    comingFrom={activeTab}
                                />
                            ))
                        )

                            : !loading && (
                                <NotFoundScreen
                                    title="Nothing here yet"
                                    description="Start swiping to find your match!"
                                />
                            )}
                    </Box>
                </ScrollView>
            </>
            }
        </Box>
    );
};

export default FavoritesScreen;