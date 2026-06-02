import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FlatList, ActivityIndicator, ScrollView, Pressable, KeyboardAvoidingView, Platform, TouchableOpacity, View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Box, Spinner, Center, HStack, Text } from '@/src/components/common/GluestackUI';
import api from '@/src/api/api';
import { ProfileCard } from './ProfileCard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { profileService } from '@/src/services/profileService';
import LottieView from 'lottie-react-native';
import NotFoundScreen from '../common/NotFoundScreen';
import FailedScreen from '../common/FailedScreen';
import { SkeletonItem } from '../common/SkeletonItem';
import { SearchActionsheet } from './home_sub_screen/SearchActionsheet';
import { ProfileCardSkeleton } from '../common/ProfileCardSkeleton';
import { useAuth } from '@/src/context/AuthContext';
import { useAppToast } from '@/src/context/ToastContext';
import {
    CaptureProtection,
    useCaptureProtection,
    CaptureEventType
} from 'react-native-capture-protection';
import { useIsFocused } from '@react-navigation/native'; // Add this import
import _ from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ShieldCheck } from '@/src/components/common/IconUI';
import { Crown } from 'lucide-react-native';
import PremiumUnlockScreen from './PremiumUnlockScreen';
import HeaderSession from '../common/HeaderSession';
const MatchesScreen = () => {

    const { user } = useAuth();
    const { showToast } = useAppToast();
    const isFocused = useIsFocused(); // This hook returns true/false when focus changes
    const { width } = Dimensions.get('window');
    const abortControllerRef = useRef<AbortController | null>(null);
    const navigation = useNavigation<any>();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [subscriptionAmount, setSubscriptionAmount] = useState(0);

    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('New');
    const [showFilters, setShowFilters] = useState(false); // Fix for More Match click
    const [isSubscribed, setisSubscribed] = useState(false);
    const [filters, setFilters] = useState({
        gender: '',
        marital_status: '',
        annual_income: '',
        min_age: 24,
        max_age: 54
    });

    // Added 'currentFilters' argument to prevent stale state issues
    // Place these inside your component

    const fetchProfiles = async (pageNumber: number, shouldRefresh = false, currentFilters = filters) => {
        // 1. Guard against unnecessary calls
        if (loading || (pageNumber > totalPages && !shouldRefresh)) return;

        // 2. Cancel pending requests (Race condition protection)
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const postBody = {
                page: pageNumber,
                ...currentFilters,
                filter_type: selectedFilter
            };

            const response = await profileService.getprofile(postBody, abortControllerRef.current.signal);

            if (response?.success) {
                const newData = response.data || [];
                setTotalPages(response.totalPages || 1);
                setProfiles((prev) => (shouldRefresh ? newData : [...prev, ...newData]));
                setPage(pageNumber);
            } else {
                // If refresh failed or no records, clear the list
                if (shouldRefresh || response?.message === "Record not found") {
                    setProfiles([]);
                }
                // Even on failure, if the server tells us they aren't subscribed, update UI

            }
            if (pageNumber === 1 && shouldRefresh) {
                setisSubscribed(!!response?.is_subscribed);
                setSubscriptionAmount(response?.subscription_amount ?? 0);
            }

        } catch (error: any) {
            if (error.name === 'AbortError' || error.message === 'canceled') return;
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    //#region CaptureProtection 
    useFocusEffect(
        useCallback(() => {
            // Security logic
            CaptureProtection.prevent({ screenshot: true, record: true, appSwitcher: true });

            // Fetch fresh data immediately on focus
            fetchProfiles(1, true);

            return () => {
                CaptureProtection.allow();
                // Cleanup: Cancel any ongoing fetch when leaving the screen
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
            };
        }, [selectedFilter]) // Only re-run if the tab changes. 
        // Don't include 'filters' if you don't want it to reset while typing.
    );
    //#endregion


    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProfiles(1, true);
    }, [filters, selectedFilter]);

    const handleLoadMore = useCallback(async () => {
        // Ensure we aren't already loading and there is a next page
        if (!loading && page < totalPages) {
            await fetchProfiles(page + 1, false);
        }
    }, [loading, page, totalPages, filters, selectedFilter]);

    const applyFilters = (newFilters: any) => {
        setFilters(newFilters);
        setShowFilters(false);
        // Fetch immediately with newFilters to bypass the state update delay
        fetchProfiles(1, true, newFilters);
    };

    const renderFooter = () => {
        if (!loading || profiles.length === 0) return <Box className="h-20" />;
        return (
            <Center className="py-10">
                <Spinner size="large" color="$cyan500" />
            </Center>
        );
    };

    const renderContent = () => {
        if (loading && profiles.length === 0) {
            return (
                <Box className="px-4 py-2">
                    <ProfileCardSkeleton />
                </Box>
            );
        }

        return (
            <FlatList
                data={profiles}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => (
                    <Box className="px-4">
                        <ProfileCard
                            user={user}
                            profile={item}
                            onPress={() => navigation.navigate('ProfileDetail', { profile_id: item.profile_id, module: 'match' })}
                            showToast={showToast}
                            reload={() => fetchProfiles(1, true)}
                        />
                    </Box>
                )}
                ListEmptyComponent={!loading ? <NotFoundScreen /> : null}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                // FIX: removeClippedSubviews improves performance for large lists
                removeClippedSubviews={Platform.OS === 'android'}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            />
        );
    };

    return (

        <Box className="flex-1 bg-background-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Suggested Profiles"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
                showLogo={false}
            />

            {isSubscribed ?
                <Box className="flex-1 bg-background-50">
                    {/* 1. Header / Tabs (Height determined by content) */}
                    <Box className="pt-4 bg-white border-b border-outline-50">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <HStack className="gap-2 pb-4 px-4">
                                {['New', 'My Match', 'More Match'].map((filter: any) => (
                                    <Pressable
                                        key={filter}
                                        onPress={() => filter === 'More Match' ? setShowFilters(true) : setSelectedFilter(filter)}
                                        className={`px-5 py-2.5 rounded-full border shadow-sm ${selectedFilter === filter ? 'bg-primary-500 border-primary-500' : 'bg-white border-outline-200'
                                            }`}
                                    >
                                        <Text className={`text-sm font-bold ${selectedFilter === filter ? 'text-white' : 'text-typography-600'}`}>
                                            {filter}
                                        </Text>
                                    </Pressable>
                                ))}
                            </HStack>
                        </ScrollView>
                    </Box>

                    {/* 2. Content Area (Fills the entire remaining screen) */}
                    <Box className="flex-1">
                        {renderContent()}
                    </Box>

                    <SearchActionsheet
                        isOpen={showFilters}
                        onClose={() => setShowFilters(false)}
                        initialFilters={filters}
                        onApply={(newFilters: any) => {
                            setFilters(newFilters);
                            setShowFilters(false);
                        }}
                    />
                </Box> :
                /* Render the Premium Glass Card UI we built earlier here */
                /* This way, the user stays on the 'Matches' tab but sees the 'Unlock' UI */
                !loading && <PremiumUnlockScreen onPay={() => navigation.navigate('Checkout', {
                    totalAmount: subscriptionAmount ?? 0,
                    customerName: user?.firstName,
                    email: user?.email,
                    phoneNo: user?.phone
                })}
                    values={{
                        totalAmount: subscriptionAmount ?? 0,
                        customerName: user?.firstName

                    }}
                />


            }
        </Box>

    );
}

export default MatchesScreen;


