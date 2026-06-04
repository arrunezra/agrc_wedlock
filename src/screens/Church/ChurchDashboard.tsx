import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Linking, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { Box, VStack, HStack, Text, Heading, Spinner, Divider, Center, ButtonText, Button, Avatar, AvatarFallbackText, AvatarImage } from '@/src/components/GluestackUI';
import api from '@/src/api/api';
import { Icon, Globe, MapPin } from '@/src/components/IconUI';
import { ChevronRight, Church, Edit3, Phone, ShieldCheck, User2Icon } from 'lucide-react-native';
import AnimatedListItem, { ChurchSkeleton } from './AnimattedSummary';
import HeaderSession from '@/src/components/HeaderSession';
import { dateFormat } from '@/src/utils/validators';

export default function ChurchDashboard({ navigation }: any) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const fetchStats = async () => {
        try {
            const res = await api.post('/church/churchmanagment.php', { action: 'fetch_stats' });
            if (res.data.success) setStats(res.data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchStats(); }, []);
    const handleOpenPreview = (item: any) => {

    }
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    // 1. Header Component (The Summary Cards)
    const Header = () => (
        <Box className="pt-10 pb-4 px-4 bg-background-50">
            {/* Title Section with Gradient-like text feel */}
            <VStack className="mb-6 px-1">
                <Text className="text-primary-600 font-bold uppercase tracking-[3px] text-[10px] mb-1">
                    Administrative Hub
                </Text>
                <Heading size="2xl" className="text-primary-900 font-black tracking-tighter">
                    System Overview
                </Heading>
            </VStack>

            {/* 1. HERO CARD: Ultra-Modern Glass Effect */}
            <TouchableOpacity onPress={() => navigation.navigate('Main', {
                screen: 'ChurchSummary'
            })}>
                <Box
                    className="bg-primary-600 p-8 rounded-[40px] shadow-2xl mb-6 relative overflow-hidden"
                    style={{ elevation: 10 }}
                >
                    <VStack className="z-10">
                        <HStack className="items-center" space="xs">
                            <Box className="w-1.5 h-1.5 rounded-full bg-primary-300 animate-pulse" />
                            <Text className="text-primary-100 font-bold uppercase tracking-widest text-[10px]">
                                Live Registry Count
                            </Text>
                        </HStack>
                        <HStack className="items-baseline" space="xs">
                            <Heading size="4xl" className="text-white font-black text-6xl tracking-tighter">
                                {stats?.total || 0}
                            </Heading>
                            <Text className="text-primary-200 font-bold text-sm">Churches</Text>
                        </HStack>
                    </VStack>

                    {/* Background Decorative Element */}
                    {/* <Box className="absolute -right-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"  > 
                </Box> */}
                    <Box className="absolute -right-4 -bottom-4 opacity-10">
                        <Icon as={Church} size="xl" className="text-white w-24 h-24" />
                    </Box>
                </Box>
            </TouchableOpacity>
            {/* 2. STATUS TILES: Specific Active & Inactive Results */}
            <HStack space="md" className="mb-8 px-1">

                {/* ACTIVE CHURCHES CARD */}
                <Box className="bg-emerald-50 p-5 rounded-[30px] flex-1 border border-emerald-100 shadow-sm relative overflow-hidden">
                    <VStack space="xs">
                        <HStack space="xs" className="items-center">
                            <Box className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" />
                            <Text className="text-emerald-700 font-black uppercase tracking-widest text-[9px]">
                                Active
                            </Text>
                        </HStack>

                        <Heading size="3xl" className="text-emerald-900 font-black tracking-tighter">
                            {stats?.active_count || 0}
                        </Heading>

                        <Text className="text-emerald-600 font-bold text-[10px] uppercase">
                            Currently Live
                        </Text>
                    </VStack>
                    {/* Subtle Decorative Icon */}
                    <Box className="absolute -right-2 -bottom-2 opacity-10">
                        <Icon as={ShieldCheck} size="xl" className="text-emerald-900 w-12 h-12" />
                    </Box>
                </Box>

                {/* INACTIVE CHURCHES - SUBTLE NEUTRAL THEME */}
                <Box className="bg-white p-5 rounded-[28px] flex-1 border border-outline-100 shadow-sm relative overflow-hidden">
                    <VStack space="xs">
                        <HStack space="xs" className="items-center">
                            {/* Muted indicator instead of bright amber */}
                            <Box className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <Text className="text-typography-500 font-bold uppercase tracking-widest text-[9px]">
                                Inactive
                            </Text>
                        </HStack>

                        <Heading size="3xl" className="text-primary-900 font-black tracking-tighter">
                            {stats?.inactive_count || 0}
                        </Heading>

                        {/* Subtle background for the status badge instead of the whole card */}
                        <Box className="bg-slate-100 self-start px-2 py-0.5 rounded-md">
                            <Text className="text-slate-600 font-bold text-[9px] uppercase">Offline</Text>
                        </Box>
                    </VStack>
                </Box>

            </HStack>

            {/* 3. DENOMINATION BENTO LIST Mulitple penecost and CSI display panna venum- Don't delete */}
            {/* <Box className="bg-white/60 rounded-[32px] p-2 border border-outline-100 shadow-sm mb-8">
                <Heading size="xs" className="my-3 ml-4 text-typography-500 uppercase tracking-[2px] font-bold">
                    Denominations
                </Heading>
                <VStack space="xs">
                    {stats?.by_denomination?.map((item: any, index: number) => (
                        <HStack
                            key={item.label}
                            className={`p-4 rounded-[20px] items-center justify-between ${index % 2 === 0 ? 'bg-white' : 'bg-transparent'}`}
                        >
                            <HStack space="md" className="items-center">
                                <Center className="w-8 h-8 rounded-full bg-primary-50">
                                    <Text className="text-primary-600 font-bold text-xs">{item.label.charAt(0)}</Text>
                                </Center>
                                <Text className="font-bold text-typography-800 text-sm">{item.label}</Text>
                            </HStack>
                            <Box className="bg-primary-700 px-4 py-1.5 rounded-full">
                                <Text className="text-white font-black text-[10px]">{item.value}</Text>
                            </Box>

                        </HStack>
                    ))}
                </VStack>
            </Box> */}

            <Divider className="mb-8 border-outline-50 opacity-50" />

            {/* 4. RECENT ACTIVITY HEADER */}
            <HStack className="justify-between items-center mb-5 px-2">
                <VStack>
                    <Heading size="md" className="text-primary-900 font-black tracking-tight">Recent Activity</Heading>
                    <Text size="xs" className="text-typography-400 font-bold uppercase tracking-tighter">Last 5 records</Text>
                </VStack>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Main', {
                            screen: 'ChurchSummary'
                        })
                    }
                    }
                    className="bg-primary-50 px-4 py-2 rounded-full border border-primary-100 "
                >
                    <HStack space="xs" className="items-center">
                        <Text size="xs" className="text-primary-700 font-black ">View All</Text>
                        <Icon as={ChevronRight} size="xs" className="text-primary-700" />
                    </HStack>
                </TouchableOpacity>
            </HStack>
        </Box>
    );

    if (loading) return <Center className="flex-1"><Spinner size="large" /></Center>;

    // 1. YOUR SKELETON ITEM
    const SkeletonItem = () => {
        const pulseAnim = useRef(new Animated.Value(0.4)).current;

        useEffect(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }, []);

        return (
            <Animated.View style={{ opacity: pulseAnim }}>
                <Box className="mx-4 p-4 mb-3 bg-white rounded-2xl border border-outline-100 shadow-sm">
                    <HStack space="md" className="items-center">
                        <Box className="w-12 h-12 rounded-full bg-background-200" />
                        <VStack space="xs" className="flex-1 justify-center">
                            <Box className="w-3/4 h-4 rounded bg-background-200" />
                            <Box className="w-1/2 h-3 rounded bg-background-200" />
                        </VStack>
                        <Box className="w-8 h-8 rounded-full bg-background-100" />
                    </HStack>
                </Box>
            </Animated.View>
        );
    };



    // 3. MAIN COMPONENT RENDER
    // In your ChurchDashboard return statement:
    return (
        <Box className="flex-1 bg-background-50">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <HeaderSession
                title="Church Overview"
                theme="emerald"
                showBackButton={false}
                onBackPress={() => navigation.goBack()}
                showRightIcon={true}
                rightIconType="menu"
                onRightPress={() => navigation.openDrawer()} // If using React Navigation Drawer
            />
            {loading && !refreshing ? (
                <VStack className="pt-4">
                    <HeaderSkeleton />
                    {[1, 2, 3, 4, 5].map((i) => <SkeletonItem key={i} />)}
                </VStack>
            ) : (
                <FlatList
                    data={loading ? [1, 2, 3, 4, 5] : stats?.recent_churches}
                    keyExtractor={(item, index) => (loading ? `skeleton-${index}` : item.id.toString())}
                    contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
                    ListHeaderComponent={Header}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#4F46E5"]}
                        />
                    }


                    renderItem={({ item, index }) => {
                        if (loading) return <ChurchSkeleton />;

                        return (
                            <AnimatedListItem key={item.id} index={index % 10}>
                                <Box className="mx-4 mb-4 overflow-hidden rounded-3xl bg-white border border-outline-100 shadow-sm">
                                    <HStack className="items-stretch">
                                        {/* 1. STATUS ACCENT */}
                                        <Box className={`w-2 ${item.active_status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />

                                        <VStack className="flex-1 p-5" space="lg">
                                            <HStack className="justify-between items-start">
                                                <HStack space="md" className="flex-1">
                                                    {/* 2. AVATAR & IDENTITY */}
                                                    <Avatar size="lg" className="bg-primary-300 rounded-2xl border-2 border-white shadow-sm">
                                                        <AvatarImage source={{ uri: item.profile_image }} />
                                                        <AvatarFallbackText className="font-bold text-primary-800">{item.church_name}</AvatarFallbackText>
                                                    </Avatar>

                                                    <VStack className="flex-1 justify-center">
                                                        <Text className="text-lg font-black text-typography-900 leading-tight">
                                                            {item.church_name}
                                                        </Text>
                                                        <Text size="sm" className="text-typography-500 font-medium">
                                                            {item.pastor_name}
                                                        </Text>
                                                    </VStack>
                                                </HStack>

                                                {/* 3. QUICK UTILITY ICONS */}
                                                <HStack space="xs">
                                                    <TouchableOpacity
                                                        className="w-10 h-10 rounded-full bg-cyan-50 items-center justify-center border border-cyan-100  "
                                                        onPress={() => Linking.openURL(`tel:${item.church_phone}`)}
                                                    >
                                                        <Icon as={Phone} size="sm" className="text-cyan-600" />
                                                    </TouchableOpacity>


                                                </HStack>
                                            </HStack>

                                            {/* 4. METADATA TAGS */}
                                            <HStack space="sm" className="items-center">
                                                <Box className="bg-slate-100 px-3 py-1 rounded-full flex-row items-center">
                                                    <Icon as={MapPin} size="xs" className="mr-1 text-slate-500" />
                                                    <Text className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{item.city_name}</Text>
                                                </Box>
                                                <Box className="bg-primary-50 px-3 py-1 rounded-full flex-row items-center">
                                                    <Icon as={Globe} size="xs" className="mr-1 text-primary-600" />
                                                    <Text className="text-[10px] font-bold text-primary-600 uppercase tracking-tight">{item.denomination_name}</Text>
                                                </Box>
                                            </HStack>

                                            {/* 5. PRIMARY ACTION */}
                                            {/* 5. PRIMARY ACTION - 2026 REFINEMENT */}
                                            <HStack className="items-center justify-between mt-2">
                                                {/* Secondary Info/Status */}
                                                <VStack>
                                                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Last Modified</Text>
                                                    <Text className="text-xs font-semibold text-slate-600">{dateFormat(item?.updated_at)}</Text>
                                                </VStack>

                                                {/* The New Action Button */}
                                                <Button
                                                    onPress={() => { navigation.navigate("Main", { screen: 'ChurchRegistration', params: { profile: item } }); }}
                                                    className="h-11 px-6 rounded-2xl bg-primary-600 shadow-lg shadow-primary-200  "
                                                    style={{
                                                        elevation: 8,
                                                        shadowColor: '#1c916aff',
                                                        shadowOffset: { width: 0, height: 4 },
                                                        shadowOpacity: 0.3,
                                                        shadowRadius: 8,
                                                    }}
                                                >
                                                    <HStack space="xs" className="items-center">
                                                        <Icon as={Edit3} size="xs" className="text-white" />
                                                        <ButtonText className="text-xs font-black text-white uppercase tracking-widest">
                                                            Manage
                                                        </ButtonText>
                                                    </HStack>
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                </Box>
                            </AnimatedListItem>
                        );
                    }}
                />

            )}
        </Box>
    );
};

const HeaderSkeleton = () => {
    return (
        <Box className="pt-10 pb-4 px-4 bg-background-50">
            {/* Title Skeleton */}
            <VStack className="mb-6 px-1" space="xs">
                <Box className="w-32 h-3 rounded bg-background-200" />
                <Box className="w-56 h-8 rounded-lg bg-background-300" />
            </VStack>

            {/* Hero Card Skeleton */}
            <Box className="bg-background-200 p-8 rounded-[40px] mb-6 h-44 justify-center" />

            {/* Status Tiles Skeleton */}
            <HStack space="md" className="mb-8 px-1">
                <Box className="bg-white p-5 rounded-[30px] flex-1 border border-outline-100 h-28" />
                <Box className="bg-white p-5 rounded-[30px] flex-1 border border-outline-100 h-28" />
            </HStack>
        </Box>
    );
};