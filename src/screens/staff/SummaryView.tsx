import { RefreshControl, TouchableOpacity, Linking, Pressable, ScrollView, FlatList, ActivityIndicator, Animated, StatusBar } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { MotiView } from 'moti';
import {
    VStack, HStack, Box, Text, Heading,
    Input,
    InputSlot,
    InputField,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
} from '@/src/components/common/GluestackUI';
import {
    Icon,
    PhoneIcon, Users, CheckCircle2,
    AddIcon
} from '@/src/components/common/IconUI';

import LinearGradient from "react-native-linear-gradient";
import FastImage from "@d11/react-native-fast-image";
import { Edit3Icon, SearchIcon, Settings2, XCircle, XIcon } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import StaffService from "@/src/services/StaffService";
import { StaffSummarySkeleton } from "./DashboardSkeleton";
import HeaderSession from "../common/HeaderSession";
import { getExtension } from "@/src/utils/common";
import { useAuth } from "@/src/context/AuthContext";
const StaffItem = ({ item, index, navigation, user }: any) => {
    const [profile, setProfile] = useState<any>("");
    //console.log('item', item);
    return <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
            type: 'timing',
            duration: 400,
            delay: index * 100
        }}
    >
        <Pressable
            onPress={() => navigation.navigate("Main", { screen: "ViewStaffinforamtion", params: { id: item.id } })}
            className="mb-3 mx-4 active:scale-[0.98] transition-transform"
        >
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={{
                    borderLeftWidth: 6,
                    borderLeftColor: item.activeStatus === 'Active' ? '#10b981' : '#cbd5e1'
                }}
                className="p-4 rounded-r-[28px] rounded-l-[10px] border border-slate-100 flex-row items-center shadow-sm"
            >
                <Box className="h-14 w-14 rounded-full bg-slate-100 border-2 border-white shadow-sm items-center justify-center overflow-hidden">
                    {/* <Text className="font-bold text-slate-400 text-lg">{item.full_name[0]}</Text> */}
                    <Avatar className="h-full w-full rounded-full">
                        <AvatarFallbackText className="font-bold text-2xl">
                            {item.full_name}
                        </AvatarFallbackText>
                        {profile && <AvatarImage source={{ uri: profile }} className="h-full w-full" />}
                        {/* <AvatarImage
                                        source={{ uri: 'https://agrcdev.jeasuns.com/agrcdev/php/uploads/profiles/thumbs/AG0126-94693_1769585743_thumbnail.jpg' }}
                                        className="h-full w-full"
                                    /> */}
                    </Avatar>
                </Box>

                <VStack className="ml-4 flex-1">
                    <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>
                        {item.full_name}
                    </Text>
                    <Text className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">
                        {item.designation_name}
                    </Text>
                </VStack>

                <HStack space="xs" className="items-center">
                    <TouchableOpacity
                        onPress={() => item.mobileNo && Linking.openURL(`tel:${item.mobileNo}`)}
                        className="h-10 w-10 bg-cyan-600 rounded-full items-center justify-center shadow-md shadow-cyan-100"
                    >
                        <Icon as={PhoneIcon} size="sm" className="text-white" />
                    </TouchableOpacity>
                </HStack>
            </LinearGradient>
        </Pressable>
    </MotiView>
};
const StaffSummaryView = ({ navigation }: any) => {
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({ fullName: '', designation: '', activeStatus: 'Active' });
    const [staffList, setStaffList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [genericSearch, setGenericSearch] = useState('');
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setGenericSearch(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        if (genericSearch !== undefined) {
            fetchStaff(1, false);
        }
    }, [filters, genericSearch]);

    const fetchStaff = async (pageNumber = 1, shouldAppend = false) => {
        // 1. Double check page limits
        if (pageNumber > totalPages && shouldAppend) return;

        // Set loading states based on whether it's the first page or pagination
        if (shouldAppend) {
            setIsMoreLoading(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await StaffService.fetchSummaryStaffData({
                action: 'fetch',
                Church_Id: '',
                page: pageNumber,
                limit: 10,
                activeStatus: filters.activeStatus,
                designation: filters.designation,
                search: genericSearch
            });
            //console.log('fetchSummaryStaffData', res);
            if (res.success) {
                // Functional state update is safer for list manipulation
                setStaffList(prev => shouldAppend ? [...prev, ...res.data] : res.data);
                setTotalPages(res.pagination.total_records);
                setPage(pageNumber);
            }
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            setTimeout(() => {
                setLoading(false);
                setRefreshing(false);
                setIsMoreLoading(false);
            }, 2000);
        }
    };

    const handleLoadMore = () => {
        // 2. Added isMoreLoading check to prevent "Double Fetching"
        if (!isMoreLoading && page < totalPages) {
            const nextPage = page + 1;
            fetchStaff(nextPage, true);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await fetchStaff(1, false);
        setRefreshing(false);
    };
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: searchTerm.length > 0 ? 1 : 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8
        }).start();
    }, [searchTerm]);
    // Define this function inside your component, but before the return
    const ListHeader = useMemo(() => {
        return (
            <VStack space="lg" className="p-4 bg-slate-50">
                <VStack space="md">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <HStack space="xs">
                            {['Active', 'Inactive'].map((filter) => {
                                const isActive = filters.activeStatus === filter;
                                return (
                                    <TouchableOpacity
                                        key={filter}
                                        onPress={() => setFilters({ ...filters, activeStatus: isActive ? '' : filter })}
                                        className={`px-5 py-2.5 rounded-2xl border ${isActive ? 'bg-slate-900 border-slate-900 shadow-md' : 'bg-white border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        <HStack space="xs" className="items-center">
                                            {isActive && <Box className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1" />}
                                            <Text className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                                {filter}
                                            </Text>
                                        </HStack>
                                    </TouchableOpacity>
                                );
                            })}
                        </HStack>
                    </ScrollView>
                </VStack>

                {/* 3. Title Section at the Bottom of Header */}
                <HStack className="justify-between items-center px-1">
                    <VStack>
                        <Heading size="md" className="text-slate-800 font-black">Recent Members</Heading>
                        <Text className="text-slate-400 text-xs font-medium">Recently updated profiles</Text>
                    </VStack>
                </HStack>
            </VStack>
        );
    }, [searchTerm, filters]); // Re-renders content without unmounting the Input
    return (

        <Box className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            {/* 2. The Header (Fixed at the top, handling the Safe Area) */}
            <HeaderSession
                title="Staff Overview"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />


            {/* 1. FIXED HEADER SECTION (Stays at top, Keyboard remains safe) */}
            <VStack space="lg" className="p-4 bg-slate-50 pt-8">
                <HStack space="sm" className="items-center mt-2">
                    <Input
                        variant="rounded"
                        className="flex-1 h-16 bg-white border-slate-100 shadow-md shadow-slate-200/50"
                    >
                        <InputSlot className="pl-5">
                            <Icon as={SearchIcon} className="text-cyan-600" size="md" />
                        </InputSlot>

                        <InputField
                            placeholder="Search staff members..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            className="text-lg font-semibold text-slate-800"
                        />

                        {/* ANIMATED CLEAR BUTTON */}
                        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: scaleAnim }}>
                            <InputSlot className="pr-4">
                                <TouchableOpacity
                                    onPress={() => setSearchTerm('')}
                                    className="bg-slate-100 rounded-full p-1.5"
                                >
                                    <Icon as={XIcon} size="xs" className="text-slate-500" />
                                </TouchableOpacity>
                            </InputSlot>
                        </Animated.View>
                    </Input>

                    {/* SETTINGS BUTTON WITH PRESS EFFECT */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {/* Open Filters */ }}
                        className="w-16 h-16 bg-slate-600 rounded-3xl items-center justify-center shadow-xl active:scale-95 transition-transform"
                    >
                        <Icon as={Settings2} className="text-cyan-400" size="md" />
                    </TouchableOpacity>
                </HStack>
            </VStack>

            {/* 2. SCROLLABLE LIST SECTION */}
            <FlatList
                data={staffList || []}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <StaffItem item={item} user={user} index={index} navigation={navigation} />
                )}

                // This is where you put your Badges and "Recent Members" Title
                ListHeaderComponent={ListHeader}

                ListEmptyComponent={() => (
                    loading ? (
                        <StaffSummarySkeleton />
                    ) : (
                        <VStack className="py-20 items-center justify-center">
                            <Text className="text-slate-400 font-bold">No Staff Found</Text>
                        </VStack>
                    )
                )}

                ListFooterComponent={() => isMoreLoading && (
                    <Box className="py-10">
                        <ActivityIndicator color="#0891b2" />
                    </Box>
                )}

                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#0891b2"
                    />
                }
                onEndReachedThreshold={0.5}
                onEndReached={handleLoadMore}
                showsVerticalScrollIndicator={false}
                className="flex-1"
            />
            <MotiView
                from={{ scale: 0, opacity: 0, translateY: 50 }}
                animate={{ scale: 1, opacity: 1, translateY: 0 }}
                transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 150,
                    delay: 400
                }}
                className="absolute bottom-8 right-8"
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate("Main", {
                        screen: "StaffRegistration",
                        params: { isEdit: false }
                    })}
                    // Added rounded-full and overflow-hidden here
                    className="h-20 w-20 rounded-full overflow-hidden shadow-2xl shadow-cyan-500/50"
                    style={{ elevation: 10 }}
                >
                    <LinearGradient
                        colors={['#0891b2', '#0e7490']}
                        // Ensure the gradient also has rounded-full
                        className="h-full w-full rounded-full items-center justify-center"
                    >
                        <Icon as={AddIcon} size="xl" className="text-cyan-400" style={{ width: 38, height: 38 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </MotiView>
        </Box>

    );
};

export default StaffSummaryView;